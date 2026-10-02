import { daysBetween } from "@/lib/dates"

export const EXPIRING_WITHIN_DAYS = 7

export type PaymentStatus = "paid" | "expiring" | "overdue" | "none"

export const PAYMENT_TYPES = ["TUITION", "CATERING"] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  TUITION: "Занималня",
  CATERING: "Кетъринг",
}

export const PAYMENT_METHODS = ["CASH", "BANK", "CARD", "OTHER"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "В брой",
  BANK: "Банков превод",
  CARD: "Карта",
  OTHER: "Друго",
}

export const STATUS_META: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: "Платено", className: "bg-[#9ED9CA]/35 text-[#1F6B5C]" },
  expiring: { label: "Изтича скоро", className: "bg-[#FFB37B]/30 text-[#9A5A21]" },
  overdue: { label: "Просрочено", className: "bg-[#F27B6B]/20 text-[#C7503F]" },
  none: { label: "Няма плащане", className: "bg-[#17324D]/8 text-[#17324D]/60" },
}

/**
 * Status from the latest covered day (max period_to) of ONE payment type.
 * A payment covering through today is still valid; it is "expiring" when it ends
 * within the next EXPIRING_WITHIN_DAYS days, and "overdue" once that day has passed.
 */
export function getPaymentStatus(paidUntil: string | null, today: string): PaymentStatus {
  if (!paidUntil) return "none"
  const remaining = daysBetween(today, paidUntil)
  if (remaining < 0) return "overdue"
  if (remaining <= EXPIRING_WITHIN_DAYS) return "expiring"
  return "paid"
}
