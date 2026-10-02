import { isValidISODate } from "@/lib/dates"
import { parseAmount } from "@/lib/money"
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-status"

export const CLASS_OPTIONS = [
  "Предучилищна",
  "1 клас",
  "2 клас",
  "3 клас",
  "4 клас",
  "5 клас",
  "6 клас",
  "7 клас",
  "8 клас",
  "9 клас",
  "10 клас",
  "11 клас",
  "12 клас",
]

export type FieldErrors = Record<string, string>

export type StudentInput = {
  firstName: string
  lastName: string
  className: string
  parentName: string
  parentPhone: string
  parentEmail: string | null
  notes: string | null
  active: boolean
}

export type PaymentInput = {
  amount: string
  paymentDate: string
  periodFrom: string
  periodTo: string
  method: PaymentMethod
  notes: string | null
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")

export function validateStudent(raw: Record<string, unknown>): { data?: StudentInput; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const firstName = str(raw.firstName)
  const lastName = str(raw.lastName)
  const className = str(raw.className)
  const parentName = str(raw.parentName)
  const parentPhone = str(raw.parentPhone)
  const parentEmail = str(raw.parentEmail)
  const notes = str(raw.notes)

  if (!firstName) errors.firstName = "Въведете име."
  else if (firstName.length > 80) errors.firstName = "Името е твърде дълго."
  if (!lastName) errors.lastName = "Въведете фамилия."
  else if (lastName.length > 80) errors.lastName = "Фамилията е твърде дълга."
  if (!className) errors.className = "Изберете клас."
  else if (!CLASS_OPTIONS.includes(className)) errors.className = "Невалиден клас."
  if (!parentName) errors.parentName = "Въведете име на родител."
  else if (parentName.length > 120) errors.parentName = "Името е твърде дълго."
  if (!parentPhone) errors.parentPhone = "Въведете телефон."
  else if (!/^[+\d][\d\s()-]{5,19}$/.test(parentPhone)) errors.parentPhone = "Невалиден телефон."
  if (parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) errors.parentEmail = "Невалиден имейл."
  if (notes.length > 1000) errors.notes = "Бележката е твърде дълга."

  if (Object.keys(errors).length > 0) return { errors }
  return {
    errors,
    data: {
      firstName,
      lastName,
      className,
      parentName,
      parentPhone,
      parentEmail: parentEmail || null,
      notes: notes || null,
      active: raw.active === true || raw.active === "true" || raw.active === "on",
    },
  }
}

export function validatePayment(raw: Record<string, unknown>): { data?: PaymentInput; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const amount = parseAmount(str(raw.amount))
  const paymentDate = str(raw.paymentDate)
  const periodFrom = str(raw.periodFrom)
  const periodTo = str(raw.periodTo)
  const method = str(raw.method) as PaymentMethod
  const notes = str(raw.notes)

  if (!amount) errors.amount = "Въведете сума по-голяма от 0 (до 2 знака след десетичната запетая)."
  if (!isValidISODate(paymentDate)) errors.paymentDate = "Невалидна дата на плащане."
  if (!isValidISODate(periodFrom)) errors.periodFrom = "Невалидна начална дата."
  if (!isValidISODate(periodTo)) errors.periodTo = "Невалидна крайна дата."
  else if (isValidISODate(periodFrom) && periodTo < periodFrom)
    errors.periodTo = "Крайната дата трябва да е след началната."
  if (!PAYMENT_METHODS.includes(method)) errors.method = "Изберете метод на плащане."
  if (notes.length > 1000) errors.notes = "Бележката е твърде дълга."

  if (Object.keys(errors).length > 0 || !amount) return { errors }
  return { errors, data: { amount, paymentDate, periodFrom, periodTo, method, notes: notes || null } }
}
