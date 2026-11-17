import { APP_TIMEZONE } from "@/lib/dates"

export const PRICE_CATEGORIES = ["Занималня", "Курсове", "Подготовка за НВО", "Работилници", "Други услуги"] as const
export type PriceCategory = (typeof PRICE_CATEGORIES)[number]

export const DISPLAY_MODES = ["amount", "free", "on_request", "coming_soon"] as const
export type DisplayMode = (typeof DISPLAY_MODES)[number]

export const DISPLAY_MODE_LABELS: Record<DisplayMode, string> = {
  amount: "Сума",
  free: "Безплатно",
  on_request: "По запитване",
  coming_soon: "Очаквайте подробности",
}

export const CURRENCIES = ["EUR", "BGN"] as const
export type PriceCurrency = (typeof CURRENCIES)[number]

const CURRENCY_SYMBOL: Record<PriceCurrency, string> = { EUR: "€", BGN: "лв" }

/** Stored without the "на"/"за" preposition and rendered after a slash: "99 € / месец". */
export const BILLING_PERIODS = ["час", "занятие", "месец", "седмица", "ден", "дете", "курс", "работилница"] as const

export type PriceGroup = {
  key: string
  service_name: string
  category: PriceCategory
  page_path: string
  title: string
  note: string | null
  sort_order: number
  updated_at: string
}

export type PriceRecord = {
  id: number
  key: string
  group_key: string
  label: string
  note: string | null
  display_mode: DisplayMode
  currency: PriceCurrency
  /** Exact decimal strings straight from Postgres `numeric`. */
  regular_price: string | null
  regular_price_bgn: string | null
  promotional_price: string | null
  promotional_price_bgn: string | null
  promotion_enabled: boolean
  promotion_starts_on: string | null
  promotion_ends_on: string | null
  billing_period: string | null
  installments: number | null
  is_visible: boolean
  sort_order: number
  updated_at: string
}

/** Formats an exact decimal string without floating-point rounding: "1085.80" -> "1 085,80". */
export function formatAmount(value: string, currency: PriceCurrency): string {
  const [whole, fraction = ""] = value.split(".")
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  const cents = fraction.padEnd(2, "0").slice(0, 2)
  const number = cents === "00" ? grouped : `${grouped},${cents}`
  return `${number} ${CURRENCY_SYMBOL[currency]}`
}

function composeAmount(amount: string, bgn: string | null, p: PriceRecord): string {
  let text = formatAmount(amount, p.currency)
  if (p.installments) text = `${p.installments} × ${text}`
  if (bgn && p.currency === "EUR") text += ` / ${formatAmount(bgn, "BGN")}`
  if (p.billing_period) text += ` / ${p.billing_period}`
  return text
}

/** Today's calendar date in Sofia, so promotions switch at local midnight regardless of server timezone. */
export function sofiaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(now)
}

export type PromotionState = "none" | "scheduled" | "active" | "expired"

export function getPromotionState(p: PriceRecord, today = sofiaToday()): PromotionState {
  if (!p.promotion_enabled || p.promotional_price === null || p.display_mode !== "amount") return "none"
  if (p.promotion_starts_on && today < p.promotion_starts_on) return "scheduled"
  if (p.promotion_ends_on && today > p.promotion_ends_on) return "expired"
  return "active"
}

export type ResolvedPrice =
  | { kind: "text"; text: string }
  | { kind: "amount"; text: string; originalText: string | null; promotional: boolean }

export function resolvePrice(p: PriceRecord, today = sofiaToday()): ResolvedPrice {
  if (p.display_mode !== "amount" || p.regular_price === null) {
    return { kind: "text", text: DISPLAY_MODE_LABELS[p.display_mode === "amount" ? "on_request" : p.display_mode] }
  }
  const regular = composeAmount(p.regular_price, p.regular_price_bgn, p)
  if (getPromotionState(p, today) === "active" && p.promotional_price !== null) {
    return {
      kind: "amount",
      text: composeAmount(p.promotional_price, p.promotional_price_bgn, p),
      originalText: regular,
      promotional: true,
    }
  }
  return { kind: "amount", text: regular, originalText: null, promotional: false }
}

/** Plain text for places that cannot render markup (metadata, admin tables). */
export function priceText(p: PriceRecord, today?: string): string {
  return resolvePrice(p, today).text
}
