"use client"

import { useState, useTransition, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { addPayment, updatePayment } from "@/app/actions/students"
import { addDays, endOfMonth, startOfMonth, todayISO } from "@/lib/dates"
import { CURRENCY } from "@/lib/money"
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS, type PaymentType } from "@/lib/payment-status"
import type { Payment } from "@/lib/students-db"
import { validatePayment, type FieldErrors } from "@/lib/student-validation"
import { Field, FormError, Modal, inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"

export type PaymentDialogState =
  | { mode: "create"; type: PaymentType; lastPaidUntil: string | null; lastAmount: string | null }
  | { mode: "edit"; payment: Payment }

function initialValues(state: PaymentDialogState) {
  if (state.mode === "edit") {
    const p = state.payment
    return {
      amount: p.amount.replace(/\.00$/, "").replace(".", ","),
      paymentDate: p.payment_date,
      periodFrom: p.period_from,
      periodTo: p.period_to,
      method: p.payment_method as string,
      notes: p.notes ?? "",
    }
  }
  // Pre-fill the next period right after the current coverage so routine monthly entries take one click.
  const today = todayISO()
  const periodFrom = state.lastPaidUntil && state.lastPaidUntil >= startOfMonth(today) ? addDays(state.lastPaidUntil, 1) : startOfMonth(today)
  return {
    amount: state.lastAmount ? state.lastAmount.replace(/\.00$/, "").replace(".", ",") : "",
    paymentDate: today,
    periodFrom,
    periodTo: endOfMonth(periodFrom),
    method: "CASH",
    notes: "",
  }
}

export function PaymentFormDialog({
  studentId,
  state,
  onClose,
  onSaved,
}: {
  studentId: number
  state: PaymentDialogState | null
  onClose: () => void
  onSaved: (message: string) => void
}) {
  return (
    <Modal
      open={state !== null}
      onClose={onClose}
      title={
        !state
          ? ""
          : state.mode === "edit"
            ? `Редактирай плащане – ${PAYMENT_TYPE_LABELS[state.payment.type]}`
            : state.type === "TUITION"
              ? "Ново плащане – занималня"
              : "Ново плащане – кетъринг"
      }
    >
      {state && (
        <PaymentForm
          key={state.mode === "edit" ? `e${state.payment.id}` : `c${state.type}`}
          studentId={studentId}
          state={state}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Modal>
  )
}

function PaymentForm({
  studentId,
  state,
  onClose,
  onSaved,
}: {
  studentId: number
  state: PaymentDialogState
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const [values, setValues] = useState(() => initialValues(state))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const type = state.mode === "edit" ? state.payment.type : state.type

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  function onPeriodFromChange(e: { target: { value: string } }) {
    const periodFrom = e.target.value
    setValues((v) => ({
      ...v,
      periodFrom,
      periodTo: periodFrom && (!v.periodTo || v.periodTo < periodFrom) ? endOfMonth(periodFrom) : v.periodTo,
    }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const { errors: clientErrors } = validatePayment(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) {
      setFormError("Моля, поправете грешките във формата.")
      return
    }
    setFormError(null)
    startTransition(async () => {
      const res =
        state.mode === "edit" ? await updatePayment(state.payment.id, values) : await addPayment(studentId, type, values)
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {})
        setFormError(res.error)
        return
      }
      onClose()
      onSaved(
        state.mode === "edit"
          ? "Плащането беше обновено успешно."
          : type === "CATERING"
            ? "Плащането за кетъринг беше добавено успешно."
            : "Плащането беше добавено успешно.",
      )
    })
  }

  const err = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`Сума (${CURRENCY.code === "EUR" ? "€" : CURRENCY.code})`} htmlFor="amount" error={errors.amount} required>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            autoFocus
            value={values.amount}
            onChange={set("amount")}
            placeholder="0,00"
            className={inputClass}
            {...err("amount")}
          />
        </Field>
        <Field label="Дата на плащане" htmlFor="paymentDate" error={errors.paymentDate} required>
          <input
            id="paymentDate"
            name="paymentDate"
            type="date"
            value={values.paymentDate}
            onChange={set("paymentDate")}
            className={inputClass}
            {...err("paymentDate")}
          />
        </Field>
        <Field label="Период от" htmlFor="periodFrom" error={errors.periodFrom} required>
          <input
            id="periodFrom"
            name="periodFrom"
            type="date"
            value={values.periodFrom}
            onChange={onPeriodFromChange}
            className={inputClass}
            {...err("periodFrom")}
          />
        </Field>
        <Field label="Период до" htmlFor="periodTo" error={errors.periodTo} required>
          <input
            id="periodTo"
            name="periodTo"
            type="date"
            min={values.periodFrom || undefined}
            value={values.periodTo}
            onChange={set("periodTo")}
            className={inputClass}
            {...err("periodTo")}
          />
        </Field>
      </div>
      <Field label="Метод на плащане" htmlFor="method" error={errors.method} required>
        <select id="method" name="method" value={values.method} onChange={set("method")} className={inputClass} {...err("method")}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Бележка" htmlFor="notes" error={errors.notes}>
        <textarea id="notes" name="notes" rows={2} value={values.notes} onChange={set("notes")} className={inputClass} {...err("notes")} />
      </Field>

      <FormError message={formError} />

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={secondaryButton}>
          Отказ
        </button>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {state.mode === "edit" ? "Запази промените" : "Запази плащането"}
        </button>
      </div>
    </form>
  )
}
