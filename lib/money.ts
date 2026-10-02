// Single place to change the admin currency (the site prices are in EUR).
export const CURRENCY = {
  code: "EUR",
  locale: "bg-BG",
} as const

const formatter = new Intl.NumberFormat(CURRENCY.locale, {
  style: "currency",
  currency: CURRENCY.code,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Amounts arrive from Postgres `numeric` as exact decimal strings; only converted to Number for display. */
export function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—"
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return "—"
  return formatter.format(n)
}

/**
 * Normalises user input ("450", "450,5", "1 200.50") into an exact decimal string
 * suitable for a `numeric(12,2)` column. Returns null when invalid or not > 0.
 */
export function parseAmount(input: string): string | null {
  const normalised = input.replace(/\s/g, "").replace(",", ".")
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(normalised)) return null
  const [whole, fraction = ""] = normalised.split(".")
  const cents = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0") || "0")
  if (cents <= BigInt(0)) return null
  return `${whole.replace(/^0+(?=\d)/, "")}.${fraction.padEnd(2, "0")}`
}
