"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/admin"
import { sql } from "@/lib/db"
import { isValidISODate } from "@/lib/dates"
import { ensureWorkshopsSchema, getWorkshopById } from "@/lib/workshops/db"
import type { RegistrationStatus, WorkshopActivity, WorkshopNotice } from "@/lib/workshops/types"

export type WorkshopEditorState = { error?: string; saved?: boolean }

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DEFAULT_ICONS = ["sparkles", "palette", "gift", "party", "shapes", "ribbon"]

async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized")
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
}

/** "Заглавие | Описание" per line. */
function pairs(value: string): { title: string; text: string }[] {
  return lines(value).map((line) => {
    const [title, ...rest] = line.split("|")
    return { title: title.trim(), text: rest.join("|").trim() }
  })
}

function optionalInt(value: string, min: number, max: number, label: string): number | null {
  if (value === "") return null
  if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`Полето „${label}“ трябва да е цяло число между ${min} и ${max}.`)
  }
  return Number(value)
}

function optionalPrice(value: string): string | null {
  if (value === "") return null
  const normalised = value.replace(/\s/g, "").replace(",", ".")
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalised)) throw new Error("Невалидна цена. Пример: 25 или 25,50")
  return normalised
}

function parseImageUrl(value: string): string {
  if (value === "") return ""
  if (value.startsWith("/images/") || value.startsWith("/api/workshop-image?pathname=workshops/")) return value
  throw new Error("Невалидно изображение.")
}

function readEditorForm(formData: FormData, previousActivities: WorkshopActivity[]) {
  const get = (key: string) => String(formData.get(key) ?? "").trim()

  const title = get("title")
  if (title.length < 3) throw new Error("Моля, въведете заглавие на работилницата.")

  const eventDate = get("event_date")
  if (eventDate && !isValidISODate(eventDate)) throw new Error("Невалидна дата.")
  const startTime = get("start_time")
  if (startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) throw new Error("Невалиден начален час.")

  const ageMin = optionalInt(get("age_min"), 0, 18, "Възраст от")
  const ageMax = optionalInt(get("age_max"), 0, 18, "Възраст до")
  if (ageMin !== null && ageMax !== null && ageMin > ageMax) throw new Error("Минималната възраст е по-голяма от максималната.")

  const iconByTitle = new Map(previousActivities.map((a) => [a.title, a.icon]))
  const activities: WorkshopActivity[] = pairs(get("activities")).map((a, i) => ({
    ...a,
    icon: iconByTitle.get(a.title) ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length],
  }))
  const notices: WorkshopNotice[] = pairs(get("notices"))

  return {
    title,
    season: get("season"),
    short_description: get("short_description"),
    hero_title: get("hero_title") || title,
    hero_subtitle: get("hero_subtitle"),
    about: String(formData.get("about") ?? "").trim(),
    activities: JSON.stringify(activities),
    materials_title: get("materials_title") || "С какво ще творим?",
    materials: JSON.stringify(lines(get("materials"))),
    take_home: JSON.stringify(lines(get("take_home"))),
    notices: JSON.stringify(notices),
    image_url: parseImageUrl(get("image_url")),
    image_alt: get("image_alt"),
    seo_title: get("seo_title") || null,
    seo_description: get("seo_description") || null,
    requires_allergy_info: formData.get("requires_allergy_info") === "on",
    event_date: eventDate || null,
    start_time: startTime || null,
    duration_minutes: optionalInt(get("duration_minutes"), 1, 1440, "Продължителност"),
    age_min: ageMin,
    age_max: ageMax,
    price: optionalPrice(get("price")),
    capacity: optionalInt(get("capacity"), 0, 1000, "Капацитет"),
    registration_enabled: formData.get("registration_enabled") === "on",
    published: formData.get("published") === "on",
    sort_order: optionalInt(get("sort_order"), 0, 1000, "Подредба") ?? 0,
  }
}

function revalidateWorkshopPages(slug?: string) {
  revalidatePath("/rabotilnici")
  if (slug) revalidatePath(`/rabotilnici/${slug}`)
  revalidatePath("/admin/rabotilnici")
}

export async function createWorkshop(_prev: WorkshopEditorState, formData: FormData): Promise<WorkshopEditorState> {
  await requireAdmin()
  let newId: number
  try {
    await ensureWorkshopsSchema()
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase()
    if (!SLUG_RE.test(slug)) return { error: "Адресът (slug) може да съдържа само латински малки букви, цифри и тирета." }
    const w = readEditorForm(formData, [])
    const rows = await sql`
      INSERT INTO workshops (
        slug, season, title, short_description, hero_title, hero_subtitle, about, activities, materials_title,
        materials, take_home, notices, image_url, image_alt, seo_title, seo_description, requires_allergy_info,
        event_date, start_time, duration_minutes, age_min, age_max, price, capacity,
        registration_enabled, published, sort_order
      ) VALUES (
        ${slug}, ${w.season}, ${w.title}, ${w.short_description}, ${w.hero_title}, ${w.hero_subtitle}, ${w.about},
        ${w.activities}::jsonb, ${w.materials_title}, ${w.materials}::jsonb, ${w.take_home}::jsonb, ${w.notices}::jsonb,
        ${w.image_url}, ${w.image_alt}, ${w.seo_title}, ${w.seo_description}, ${w.requires_allergy_info},
        ${w.event_date}, ${w.start_time}, ${w.duration_minutes}, ${w.age_min}, ${w.age_max}, ${w.price}, ${w.capacity},
        ${w.registration_enabled}, ${w.published}, ${w.sort_order}
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `
    if (rows.length === 0) return { error: "Вече съществува работилница с този адрес." }
    newId = rows[0].id as number
    revalidateWorkshopPages(slug)
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Възникна грешка." }
  }
  redirect(`/admin/rabotilnici/${newId}`)
}

export async function updateWorkshop(
  id: number,
  _prev: WorkshopEditorState,
  formData: FormData,
): Promise<WorkshopEditorState> {
  await requireAdmin()
  try {
    const existing = await getWorkshopById(id)
    if (!existing) return { error: "Работилницата не е намерена." }
    const w = readEditorForm(formData, existing.activities)
    await sql`
      UPDATE workshops SET
        season = ${w.season}, title = ${w.title}, short_description = ${w.short_description},
        hero_title = ${w.hero_title}, hero_subtitle = ${w.hero_subtitle}, about = ${w.about},
        activities = ${w.activities}::jsonb, materials_title = ${w.materials_title},
        materials = ${w.materials}::jsonb, take_home = ${w.take_home}::jsonb, notices = ${w.notices}::jsonb,
        image_url = ${w.image_url}, image_alt = ${w.image_alt}, seo_title = ${w.seo_title},
        seo_description = ${w.seo_description}, requires_allergy_info = ${w.requires_allergy_info},
        event_date = ${w.event_date}, start_time = ${w.start_time}, duration_minutes = ${w.duration_minutes},
        age_min = ${w.age_min}, age_max = ${w.age_max}, price = ${w.price}, capacity = ${w.capacity},
        registration_enabled = ${w.registration_enabled}, published = ${w.published},
        sort_order = ${w.sort_order}, updated_at = now()
      WHERE id = ${id}
    `
    revalidateWorkshopPages(existing.slug)
    revalidatePath(`/admin/rabotilnici/${id}`)
    return { saved: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Възникна грешка." }
  }
}

export async function setWorkshopRegistrationEnabled(id: number, enabled: boolean) {
  await requireAdmin()
  const rows = await sql`
    UPDATE workshops SET registration_enabled = ${enabled}, updated_at = now() WHERE id = ${id} RETURNING slug
  `
  revalidateWorkshopPages(rows[0]?.slug as string | undefined)
}

/**
 * Status changes keep `reserved_count` in sync atomically. Re-activating a
 * cancelled registration only succeeds while a place is still free.
 */
export async function setRegistrationStatus(
  registrationId: number,
  status: RegistrationStatus,
): Promise<{ error?: string }> {
  await requireAdmin()
  if (!["new", "confirmed", "cancelled"].includes(status)) return { error: "Невалиден статус." }

  const current = await sql`SELECT workshop_id, status FROM workshop_registrations WHERE id = ${registrationId}`
  if (current.length === 0) return { error: "Заявката не е намерена." }
  const oldStatus = current[0].status as RegistrationStatus
  const workshopId = current[0].workshop_id as number
  if (oldStatus === status) return {}

  try {
    if (status === "cancelled") {
      await sql`
        WITH r AS (
          UPDATE workshop_registrations SET status = 'cancelled', updated_at = now()
          WHERE id = ${registrationId} AND status <> 'cancelled'
          RETURNING workshop_id
        )
        UPDATE workshops SET reserved_count = GREATEST(reserved_count - 1, 0), updated_at = now()
        WHERE id IN (SELECT workshop_id FROM r)
      `
    } else if (oldStatus === "cancelled") {
      const rows = await sql`
        WITH slot AS (
          UPDATE workshops SET reserved_count = reserved_count + 1, updated_at = now()
          WHERE id = ${workshopId} AND (capacity IS NULL OR reserved_count < capacity)
          RETURNING id
        )
        UPDATE workshop_registrations SET status = ${status}, updated_at = now()
        WHERE id = ${registrationId} AND status = 'cancelled' AND EXISTS (SELECT 1 FROM slot)
        RETURNING id
      `
      if (rows.length === 0) return { error: "Няма свободни места – заявката не може да бъде възстановена." }
    } else {
      await sql`
        UPDATE workshop_registrations SET status = ${status}, updated_at = now()
        WHERE id = ${registrationId} AND status <> 'cancelled'
      `
    }
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { error: "Има друга активна заявка за същото дете и имейл." }
    }
    throw err
  }

  const slugRows = await sql`SELECT slug FROM workshops WHERE id = ${workshopId}`
  revalidateWorkshopPages(slugRows[0]?.slug as string | undefined)
  revalidatePath(`/admin/rabotilnici/${workshopId}`)
  return {}
}
