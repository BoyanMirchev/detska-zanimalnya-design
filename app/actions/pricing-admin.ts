"use server"

import { revalidatePath, updateTag } from "next/cache"
import { isAuthenticated } from "@/app/actions/admin"
import { sql } from "@/lib/db"
import { isValidISODate } from "@/lib/dates"
import {
  PRICES_TAG,
  ensurePricingSchema,
  getAdminGroupByKey,
  getAdminPriceById,
  type PriceChange,
} from "@/lib/pricing/db"
import { CURRENCIES, DISPLAY_MODES, PRICE_CATEGORIES, type DisplayMode, type PriceCurrency } from "@/lib/pricing/types"

export type PriceEditorState = { error?: string; saved?: boolean; message?: string }

/**
 * The site uses one shared admin password, so there is no per-person identity
 * to record. Kept in one place so it can be swapped for a real user name once
 * individual admin accounts exist.
 */
const CHANGED_BY = "Администратор"

const SAVED_MESSAGE = "Цената е обновена успешно."

class ValidationError extends Error {}

async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized")
}

function text(formData: FormData, key: string, max: number): string {
  const value = String(formData.get(key) ?? "").trim()
  if (value.length > max) throw new ValidationError(`Полето е твърде дълго (максимум ${max} знака).`)
  return value
}

/** Accepts "25", "25,5", "1 085,80"; returns an exact decimal string. Empty stays null, never zero. */
function amount(formData: FormData, key: string, label: string): string | null {
  const raw = text(formData, key, 20).replace(/\s/g, "").replace(",", ".")
  if (raw === "") return null
  if (raw.startsWith("-")) throw new ValidationError(`„${label}“ не може да бъде отрицателна.`)
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(raw)) {
    throw new ValidationError(`„${label}“ трябва да е число с до 2 знака след десетичната запетая. Пример: 25 или 25,50`)
  }
  const [whole, fraction] = raw.split(".")
  return `${String(Number(whole))}${fraction ? `.${fraction.padEnd(2, "0")}` : ""}`
}

function optionalDate(formData: FormData, key: string, label: string): string | null {
  const value = text(formData, key, 10)
  if (value === "") return null
  if (!isValidISODate(value)) throw new ValidationError(`Невалидна дата в „${label}“.`)
  return value
}

function same(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return a === b
  const na = Number(a)
  const nb = Number(b)
  return Number.isFinite(na) && Number.isFinite(nb) && /^\d/.test(a) && /^\d/.test(b) ? na === nb : a === b
}

function diff(fields: [string, string | null, string | null][]): PriceChange[] {
  return fields.filter(([, from, to]) => !same(from, to)).map(([field, from, to]) => ({ field, from, to }))
}

function bool(v: boolean): string {
  return v ? "да" : "не"
}

function revalidatePricePages(pagePath: string) {
  // Expire the shared public price cache immediately (read-your-writes) and the affected page.
  updateTag(PRICES_TAG)
  revalidatePath(pagePath)
  if (pagePath.startsWith("/rabotilnici/")) revalidatePath("/rabotilnici")
  revalidatePath("/admin/ceni")
  revalidatePath("/admin/ceni/istoriya")
}

function failure(err: unknown): PriceEditorState {
  if (err instanceof ValidationError) return { error: err.message }
  console.error("[pricing] save failed", err)
  return { error: "Промените не бяха запазени поради грешка на сървъра. Моля, опитайте отново." }
}

export async function updatePrice(id: number, _prev: PriceEditorState, formData: FormData): Promise<PriceEditorState> {
  await requireAdmin()
  try {
    if (!Number.isInteger(id) || id <= 0) return { error: "Невалидна цена." }
    const existing = await getAdminPriceById(id)
    if (!existing) return { error: "Цената не е намерена." }
    const group = await getAdminGroupByKey(existing.group_key)
    if (!group) return { error: "Услугата не е намерена." }

    // Only these whitelisted fields are ever read from the form (no mass assignment).
    const label = text(formData, "label", 160)
    if (label.length < 2) return { error: "Моля, въведете етикет на цената." }
    const note = text(formData, "note", 400) || null

    const displayMode = text(formData, "display_mode", 20) as DisplayMode
    if (!DISPLAY_MODES.includes(displayMode)) return { error: "Невалиден начин на показване." }

    const currency = text(formData, "currency", 3) as PriceCurrency
    if (!CURRENCIES.includes(currency)) return { error: "Невалидна валута." }

    const regular = amount(formData, "regular_price", "Редовна цена")
    const regularBgn = amount(formData, "regular_price_bgn", "Редовна цена в лева")
    const promo = amount(formData, "promotional_price", "Промоционална цена")
    const promoBgn = amount(formData, "promotional_price_bgn", "Промоционална цена в лева")
    const promotionEnabled = formData.get("promotion_enabled") === "on"
    const startsOn = optionalDate(formData, "promotion_starts_on", "Начало на промоцията")
    const endsOn = optionalDate(formData, "promotion_ends_on", "Край на промоцията")
    const billingPeriod = text(formData, "billing_period", 40).replace(/^(на|за)\s+/i, "") || null
    const installmentsRaw = text(formData, "installments", 2)
    const isVisible = formData.get("is_visible") === "on"

    let installments: number | null = null
    if (installmentsRaw !== "") {
      if (!/^\d+$/.test(installmentsRaw) || Number(installmentsRaw) < 2 || Number(installmentsRaw) > 24) {
        return { error: "Броят вноски трябва да е между 2 и 24 или празно поле." }
      }
      installments = Number(installmentsRaw)
    }

    if (displayMode === "amount" && regular === null) {
      return { error: "Въведете редовна цена или изберете „Безплатно“, „По запитване“ или „Очаквайте подробности“." }
    }
    if (currency === "BGN" && (regularBgn !== null || promoBgn !== null)) {
      return { error: "Цената в лева като втора стойност се използва само когато основната валута е евро." }
    }
    if (promotionEnabled) {
      if (displayMode !== "amount") return { error: "Промоция може да се включи само за цена със сума." }
      if (promo === null) return { error: "Въведете промоционална цена или изключете промоцията." }
      if (regular !== null && Number(promo) >= Number(regular)) {
        return { error: "Промоционалната цена трябва да е по-ниска от редовната." }
      }
      if (regularBgn !== null && promoBgn === null) {
        return { error: "Въведете и промоционалната цена в лева, за да се показват и двете валути." }
      }
    }
    if (startsOn && endsOn && startsOn > endsOn) return { error: "Началото на промоцията е след нейния край." }

    const changes = diff([
      ["Етикет", existing.label, label],
      ["Описание", existing.note, note],
      ["Начин на показване", existing.display_mode, displayMode],
      ["Валута", existing.currency, currency],
      ["Редовна цена", existing.regular_price, regular],
      ["Редовна цена (лв)", existing.regular_price_bgn, regularBgn],
      ["Промоционална цена", existing.promotional_price, promo],
      ["Промоционална цена (лв)", existing.promotional_price_bgn, promoBgn],
      ["Промоция включена", bool(existing.promotion_enabled), bool(promotionEnabled)],
      ["Начало на промоцията", existing.promotion_starts_on, startsOn],
      ["Край на промоцията", existing.promotion_ends_on, endsOn],
      ["Период", existing.billing_period, billingPeriod],
      ["Вноски", existing.installments?.toString() ?? null, installments?.toString() ?? null],
      ["Видима", bool(existing.is_visible), bool(isVisible)],
    ])
    if (changes.length === 0) return { saved: true, message: "Няма промени за запазване." }

    // Optimistic concurrency: refuse to overwrite a record changed by someone else meanwhile.
    const updated = await sql`
      UPDATE prices SET
        label = ${label}, note = ${note}, display_mode = ${displayMode}, currency = ${currency},
        regular_price = ${regular}, regular_price_bgn = ${regularBgn},
        promotional_price = ${promo}, promotional_price_bgn = ${promoBgn},
        promotion_enabled = ${promotionEnabled}, promotion_starts_on = ${startsOn}, promotion_ends_on = ${endsOn},
        billing_period = ${billingPeriod}, installments = ${installments}, is_visible = ${isVisible},
        updated_at = now()
      WHERE id = ${id} AND updated_at::text = ${existing.updated_at}
      RETURNING id
    `
    if (updated.length === 0) {
      return { error: "Цената беше променена междувременно. Презаредете страницата и опитайте отново." }
    }
    await sql`
      INSERT INTO price_history (price_id, entity, entity_key, entity_label, changed_by, changes)
      VALUES (${id}, 'price', ${existing.key}, ${`${group.service_name} — ${label}`}, ${CHANGED_BY}, ${JSON.stringify(changes)}::jsonb)
    `
    revalidatePricePages(group.page_path)
    revalidatePath(`/admin/ceni/${id}`)
    return { saved: true, message: SAVED_MESSAGE }
  } catch (err) {
    return failure(err)
  }
}

export async function updatePriceGroup(
  key: string,
  _prev: PriceEditorState,
  formData: FormData,
): Promise<PriceEditorState> {
  await requireAdmin()
  try {
    await ensurePricingSchema()
    const group = await getAdminGroupByKey(key)
    if (!group) return { error: "Услугата не е намерена." }

    const title = text(formData, "title", 160)
    const note = text(formData, "note", 600) || null
    // Workshop groups mirror the workshop title/page/category; only the heading text is editable here.
    const serviceName = group.workshop_id ? group.service_name : text(formData, "service_name", 160)
    const category = group.workshop_id ? group.category : text(formData, "category", 40)
    if (serviceName.length < 2) return { error: "Моля, въведете име на услугата." }
    if (!PRICE_CATEGORIES.includes(category as (typeof PRICE_CATEGORIES)[number])) {
      return { error: "Невалидна категория." }
    }

    const changes = diff([
      ["Услуга", group.service_name, serviceName],
      ["Категория", group.category, category],
      ["Заглавие на таблицата", group.title, title],
      ["Бележка под таблицата", group.note, note],
    ])
    if (changes.length === 0) return { saved: true, message: "Няма промени за запазване." }

    await sql`
      UPDATE price_groups SET service_name = ${serviceName}, category = ${category}, title = ${title},
        note = ${note}, updated_at = now()
      WHERE key = ${key}
    `
    await sql`
      INSERT INTO price_history (price_id, entity, entity_key, entity_label, changed_by, changes)
      VALUES (NULL, 'group', ${key}, ${serviceName}, ${CHANGED_BY}, ${JSON.stringify(changes)}::jsonb)
    `
    revalidatePricePages(group.page_path)
    return { saved: true, message: "Промените са запазени успешно." }
  } catch (err) {
    return failure(err)
  }
}
