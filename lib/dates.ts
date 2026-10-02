// All payment dates are calendar dates (YYYY-MM-DD) without a time component.
// "Today" is resolved in the center's timezone so statuses flip at local midnight.
export const APP_TIMEZONE = "Europe/Sofia"

export const MONTHS_BG = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
]

export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function toUTC(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUTC(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(value: string, days: number): string {
  const date = toUTC(value)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUTC(date)
}

export function endOfMonth(value: string): string {
  const [y, m] = value.split("-").map(Number)
  return fromUTC(new Date(Date.UTC(y, m, 0)))
}

export function startOfMonth(value: string): string {
  return `${value.slice(0, 7)}-01`
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / 86_400_000)
}

/** Inclusive first day and exclusive next-month first day for a given month (1-12). */
export function monthRange(year: number, month: number) {
  const start = fromUTC(new Date(Date.UTC(year, month - 1, 1)))
  const next = fromUTC(new Date(Date.UTC(year, month, 1)))
  return { start, next }
}

export function formatDateBG(value: string | null | undefined): string {
  if (!value) return "—"
  const [y, m, d] = value.split("-")
  return `${d}.${m}.${y}`
}
