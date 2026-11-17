// Pure workshop types and formatting helpers shared by server pages, client
// components and admin screens. No database or server-only imports here.
import { APP_TIMEZONE, todayISO } from "@/lib/dates"
import { formatMoney } from "@/lib/money"

export type WorkshopActivity = { title: string; text: string; icon?: string }
export type WorkshopNotice = { title: string; text: string }

export type Workshop = {
  id: number
  slug: string
  season: string
  title: string
  short_description: string
  hero_title: string
  hero_subtitle: string
  about: string
  activities: WorkshopActivity[]
  materials_title: string
  materials: string[]
  take_home: string[]
  notices: WorkshopNotice[]
  image_url: string
  image_alt: string
  seo_title: string | null
  seo_description: string | null
  requires_allergy_info: boolean
  event_date: string | null
  start_time: string | null
  duration_minutes: number | null
  age_min: number | null
  age_max: number | null
  price: string | null
  capacity: number | null
  reserved_count: number
  registration_enabled: boolean
  published: boolean
  sort_order: number
}

export type RegistrationStatus = "new" | "confirmed" | "cancelled"

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  new: "Нова заявка",
  confirmed: "Потвърдена",
  cancelled: "Отказана",
}

export type WorkshopRegistration = {
  id: number
  workshop_id: number
  parent_name: string
  phone: string
  email: string
  child_name: string
  child_age: number
  has_allergies: boolean | null
  allergy_details: string | null
  notes: string | null
  status: RegistrationStatus
  consent_at: string
  created_at: string
}

export const PENDING_DETAILS = "Очаквайте подробности"

export type Availability =
  | { state: "open"; free: number | null }
  | { state: "full"; free: 0 }
  | { state: "closed"; free: number | null }
  | { state: "past"; free: number | null }

/** Free places are only ever derived from configured capacity minus held registrations. */
export function getAvailability(w: Pick<Workshop, "registration_enabled" | "capacity" | "reserved_count" | "event_date">): Availability {
  const free = w.capacity === null ? null : Math.max(0, w.capacity - w.reserved_count)
  if (w.event_date && w.event_date < todayISO()) return { state: "past", free }
  if (!w.registration_enabled) return { state: "closed", free }
  if (free === 0) return { state: "full", free: 0 }
  return { state: "open", free }
}

export const AVAILABILITY_MESSAGES: Record<Availability["state"], string> = {
  open: "Записването е отворено",
  full: "Местата са запълнени",
  closed: "Записването все още не е отворено",
  past: "Работилницата вече се проведе",
}

export function formatWorkshopDate(value: string | null): string {
  if (!value) return PENDING_DETAILS
  const [y, m, d] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("bg-BG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function formatStartTime(value: string | null): string {
  return value ? `${value} ч.` : PENDING_DETAILS
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return PENDING_DETAILS
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h} ч. и ${m} мин.`
  if (h) return `${h} ч.`
  return `${m} мин.`
}

export function formatAgeRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${min}–${max} г.`
  if (min !== null) return `над ${min} г.`
  if (max !== null) return `до ${max} г.`
  return PENDING_DETAILS
}

export function formatWorkshopPrice(price: string | null): string {
  if (price === null) return PENDING_DETAILS
  return Number(price) === 0 ? "Безплатно" : formatMoney(price)
}

export function formatFreePlaces(w: Pick<Workshop, "capacity" | "reserved_count">): string {
  if (w.capacity === null) return PENDING_DETAILS
  const free = Math.max(0, w.capacity - w.reserved_count)
  return `${free} от ${w.capacity}`
}

/** "about" is stored as plain text; blank lines separate paragraphs. */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** ISO 8601 start/end with the correct Europe/Sofia offset for schema.org Event data. */
export function eventDateTimes(date: string, time: string, durationMinutes: number | null) {
  const [y, mo, d] = date.split("-").map(Number)
  const [h, mi] = time.split(":").map(Number)
  const probe = new Date(Date.UTC(y, mo - 1, d, h, mi))
  const offsetPart = new Intl.DateTimeFormat("en-US", { timeZone: APP_TIMEZONE, timeZoneName: "longOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value
  const offset = offsetPart && offsetPart !== "GMT" ? offsetPart.replace("GMT", "") : "+00:00"
  const pad = (n: number) => String(n).padStart(2, "0")
  const fmt = (dt: Date) =>
    `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:00${offset}`
  const start = fmt(probe)
  const end = durationMinutes ? fmt(new Date(probe.getTime() + durationMinutes * 60_000)) : undefined
  return { start, end }
}

/** Uploaded images are served through our own route; static ones live in /public. */
export function isProxiedImage(url: string) {
  return url.startsWith("/api/")
}
