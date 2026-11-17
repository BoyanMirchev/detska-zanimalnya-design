"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react"
import { updatePrice, updatePriceGroup, type PriceEditorState } from "@/app/actions/pricing-admin"
import { Field, FormError, inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"
import { InlinePrice } from "@/components/pricing/price-display"
import {
  BILLING_PERIODS,
  CURRENCIES,
  DISPLAY_MODES,
  DISPLAY_MODE_LABELS,
  PRICE_CATEGORIES,
  type DisplayMode,
  type PriceCurrency,
  type PriceGroup,
  type PriceRecord,
} from "@/lib/pricing/types"

const card = "flex flex-col gap-5 rounded-[28px] bg-white p-6 shadow-sm"

function toInput(value: string | null): string {
  return value === null ? "" : value.replace(".", ",")
}

function toDecimal(value: string): string | null {
  const v = value.replace(/\s/g, "").replace(",", ".")
  return /^\d{1,8}(\.\d{1,2})?$/.test(v) ? v : null
}

function SavedNotice({ state }: { state: PriceEditorState }) {
  if (!state.saved || !state.message) return null
  return (
    <p role="status" className="inline-flex items-center gap-2 rounded-2xl bg-[#9ED9CA]/35 px-4 py-3 text-sm font-extrabold text-[#1F6B5C]">
      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
      {state.message}
    </p>
  )
}

export function PriceEditor({ price, group }: { price: PriceRecord; group: PriceGroup }) {
  const [state, action, pending] = useActionState(updatePrice.bind(null, price.id), {} as PriceEditorState)

  const [mode, setMode] = useState<DisplayMode>(price.display_mode)
  const [currency, setCurrency] = useState<PriceCurrency>(price.currency)
  const [regular, setRegular] = useState(toInput(price.regular_price))
  const [regularBgn, setRegularBgn] = useState(toInput(price.regular_price_bgn))
  const [promo, setPromo] = useState(toInput(price.promotional_price))
  const [promoBgn, setPromoBgn] = useState(toInput(price.promotional_price_bgn))
  const [promoEnabled, setPromoEnabled] = useState(price.promotion_enabled)
  const [startsOn, setStartsOn] = useState(price.promotion_starts_on ?? "")
  const [endsOn, setEndsOn] = useState(price.promotion_ends_on ?? "")
  const [period, setPeriod] = useState(price.billing_period ?? "")
  const [installments, setInstallments] = useState(price.installments?.toString() ?? "")

  const preview: PriceRecord = {
    ...price,
    display_mode: mode,
    currency,
    regular_price: toDecimal(regular),
    regular_price_bgn: currency === "EUR" ? toDecimal(regularBgn) : null,
    promotional_price: toDecimal(promo),
    promotional_price_bgn: currency === "EUR" ? toDecimal(promoBgn) : null,
    promotion_enabled: promoEnabled,
    promotion_starts_on: startsOn || null,
    promotion_ends_on: endsOn || null,
    billing_period: period || null,
    installments: /^\d+$/.test(installments) ? Number(installments) : null,
  }
  const isAmount = mode === "amount"

  return (
    <form action={action} className="flex flex-col gap-6" aria-busy={pending}>
      <input type="hidden" name="currency" value={currency} />

      <section className={card} aria-labelledby="price-main">
        <h2 id="price-main" className="text-lg font-extrabold text-[#17324D]">Цена</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Етикет на цената" htmlFor="label" required>
            <input id="label" name="label" defaultValue={price.label} required maxLength={160} className={inputClass} />
          </Field>
          <Field label="Начин на показване" htmlFor="display_mode">
            <select id="display_mode" name="display_mode" value={mode} onChange={(e) => setMode(e.target.value as DisplayMode)} className={inputClass}>
              {DISPLAY_MODES.map((m) => (
                <option key={m} value={m}>{DISPLAY_MODE_LABELS[m]}</option>
              ))}
            </select>
          </Field>
        </div>

        {isAmount && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Валута" htmlFor="currency_select">
                <select id="currency_select" value={currency} onChange={(e) => setCurrency(e.target.value as PriceCurrency)} className={inputClass}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c === "EUR" ? "Евро (€)" : "Лева (лв.)"}</option>
                  ))}
                </select>
              </Field>
              <Field label={`Редовна цена (${currency === "EUR" ? "€" : "лв."})`} htmlFor="regular_price" required>
                <input id="regular_price" name="regular_price" inputMode="decimal" value={regular} onChange={(e) => setRegular(e.target.value)} placeholder="Напр. 25 или 25,50" className={inputClass} />
              </Field>
              {currency === "EUR" && (
                <Field label="Редовна цена в лева (по избор)" htmlFor="regular_price_bgn">
                  <input id="regular_price_bgn" name="regular_price_bgn" inputMode="decimal" value={regularBgn} onChange={(e) => setRegularBgn(e.target.value)} placeholder="Показва се до еврото" className={inputClass} />
                </Field>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Период" htmlFor="billing_period">
                <input id="billing_period" name="billing_period" list="billing-periods" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Напр. месец (празно = без период)" maxLength={40} className={inputClass} />
                <datalist id="billing-periods">
                  {BILLING_PERIODS.map((p) => <option key={p} value={p} />)}
                </datalist>
              </Field>
              <Field label="Брой вноски (по избор)" htmlFor="installments">
                <input id="installments" name="installments" inputMode="numeric" value={installments} onChange={(e) => setInstallments(e.target.value)} placeholder="Напр. 2" className={inputClass} />
              </Field>
            </div>
          </>
        )}

        <Field label="Допълнителен текст (по избор)" htmlFor="note">
          <textarea id="note" name="note" rows={2} defaultValue={price.note ?? ""} maxLength={400} className={inputClass} />
        </Field>

        <label className="inline-flex w-fit cursor-pointer items-center gap-3 font-extrabold text-[#17324D]">
          <input type="checkbox" name="is_visible" defaultChecked={price.is_visible} className="h-5 w-5 accent-[#1F6B5C]" />
          Показвай цената на сайта
        </label>
      </section>

      {isAmount && (
        <section className={card} aria-labelledby="price-promo">
          <h2 id="price-promo" className="text-lg font-extrabold text-[#17324D]">Промоция</h2>
          <label className="inline-flex w-fit cursor-pointer items-center gap-3 font-extrabold text-[#17324D]">
            <input type="checkbox" name="promotion_enabled" checked={promoEnabled} onChange={(e) => setPromoEnabled(e.target.checked)} className="h-5 w-5 accent-[#E8590C]" />
            Включи промоционална цена
          </label>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label={`Промоционална цена (${currency === "EUR" ? "€" : "лв."})`} htmlFor="promotional_price">
              <input id="promotional_price" name="promotional_price" inputMode="decimal" value={promo} onChange={(e) => setPromo(e.target.value)} className={inputClass} />
            </Field>
            {currency === "EUR" && (
              <Field label="Промоционална цена в лева" htmlFor="promotional_price_bgn">
                <input id="promotional_price_bgn" name="promotional_price_bgn" inputMode="decimal" value={promoBgn} onChange={(e) => setPromoBgn(e.target.value)} className={inputClass} />
              </Field>
            )}
            <Field label="Начало (по избор)" htmlFor="promotion_starts_on">
              <input id="promotion_starts_on" name="promotion_starts_on" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Край (по избор, включително)" htmlFor="promotion_ends_on">
              <input id="promotion_ends_on" name="promotion_ends_on" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <p className="text-sm font-bold text-[#17324D]/60">
            Датите се отчитат по българско време. След крайната дата сайтът автоматично показва редовната цена.
          </p>
        </section>
      )}

      <section className={card} aria-labelledby="price-preview">
        <h2 id="price-preview" className="text-lg font-extrabold text-[#17324D]">Как ще изглежда на сайта</h2>
        <div className="rounded-2xl bg-[#FFF6EA] px-5 py-4 text-lg text-[#3B2416]">
          <InlinePrice price={preview} />
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <FormError message={state.error} />
        <SavedNotice state={state} />
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending} className={primaryButton}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {pending ? "Запазване…" : "Запази промените"}
          </button>
          <Link href="/admin/ceni" className={secondaryButton}>Откажи</Link>
          <Link href={group.page_path} target="_blank" className={secondaryButton}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Преглед на страницата
          </Link>
        </div>
      </div>
    </form>
  )
}

export function PriceGroupEditor({ group, isWorkshop }: { group: PriceGroup; isWorkshop: boolean }) {
  const [state, action, pending] = useActionState(updatePriceGroup.bind(null, group.key), {} as PriceEditorState)
  return (
    <form action={action} className={card} aria-busy={pending}>
      <h2 className="text-lg font-extrabold text-[#17324D]">Услуга и таблица</h2>
      {isWorkshop && (
        <p className="text-sm font-bold text-[#17324D]/60">
          Името и категорията следват работилницата и се променят от „Работилници“.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Услуга / Курс" htmlFor="service_name">
          <input id="service_name" name="service_name" defaultValue={group.service_name} disabled={isWorkshop} maxLength={160} className={inputClass} />
        </Field>
        <Field label="Категория" htmlFor="category">
          <select id="category" name="category" defaultValue={group.category} disabled={isWorkshop} className={inputClass}>
            {PRICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Заглавие на ценовата таблица" htmlFor="title">
          <input id="title" name="title" defaultValue={group.title} maxLength={160} className={inputClass} />
        </Field>
        <Field label="Бележка под таблицата (по избор)" htmlFor="group_note">
          <input id="group_note" name="note" defaultValue={group.note ?? ""} maxLength={600} className={inputClass} />
        </Field>
      </div>
      <FormError message={state.error} />
      <SavedNotice state={state} />
      <div>
        <button type="submit" disabled={pending} className={secondaryButton}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {pending ? "Запазване…" : "Запази услугата"}
        </button>
      </div>
    </form>
  )
}
