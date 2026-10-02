"use client"

import { useCallback, useState, useTransition } from "react"
import { Loader2, Mail, Pencil, Phone, Plus, Trash2, UtensilsCrossed, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { deletePayment } from "@/app/actions/students"
import { DeleteStudentDialog } from "@/components/admin/delete-student-dialog"
import { formatDateBG } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
  getPaymentStatus,
  type PaymentType,
} from "@/lib/payment-status"
import type { Payment, StudentDetail as StudentDetailData } from "@/lib/students-db"
import { PaymentFormDialog, type PaymentDialogState } from "@/components/admin/payment-form-dialog"
import { StudentFormDialog } from "@/components/admin/student-form-dialog"
import { FormError, Modal, StatusBadge, Toast, dangerButton, primaryButton, secondaryButton } from "@/components/admin/ui"

const HISTORY_FILTERS = [
  { value: "all", label: "Всички" },
  { value: "TUITION", label: "Занималня" },
  { value: "CATERING", label: "Кетъринг" },
] as const

export function StudentDetail({
  student,
  payments,
  today,
}: {
  student: StudentDetailData
  payments: Payment[]
  today: string
}) {
  const router = useRouter()
  const [editingStudent, setEditingStudent] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState | null>(null)
  const [deleting, setDeleting] = useState<Payment | null>(null)
  const [historyFilter, setHistoryFilter] = useState<(typeof HISTORY_FILTERS)[number]["value"]>("all")
  const [toast, setToast] = useState<string | null>(null)
  const clearToast = useCallback(() => setToast(null), [])

  const visiblePayments = historyFilter === "all" ? payments : payments.filter((p) => p.type === historyFilter)

  function openCreate(type: PaymentType) {
    setPaymentDialog({
      mode: "create",
      type,
      lastPaidUntil: type === "TUITION" ? student.tuition_to : student.catering_to,
      lastAmount: type === "TUITION" ? student.tuition_amount : student.catering_amount,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="student-info" className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2 id="student-info" className="text-lg font-extrabold text-[#17324D]">
            Данни за ученика
          </h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setEditingStudent(true)} className={secondaryButton}>
              <Pencil className="h-4 w-4" />
              Редактирай
            </button>
            <button type="button" onClick={() => setDeletingStudent(true)} className={dangerButton}>
              <Trash2 className="h-4 w-4" />
              Изтрий ученика
            </button>
          </div>
        </div>
        <dl className="mt-4 grid gap-4 text-[#17324D] sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Ученик" value={`${student.first_name} ${student.last_name}`} />
          <Info label="Клас" value={student.class} />
          <Info label="Родител" value={student.parent_name} />
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-wide text-[#17324D]/45">Телефон</dt>
            <dd className="mt-1 font-extrabold">
              <a href={`tel:${student.parent_phone}`} className="inline-flex items-center gap-1.5 hover:text-[#3E8F82]">
                <Phone className="h-4 w-4" />
                {student.parent_phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-wide text-[#17324D]/45">Имейл</dt>
            <dd className="mt-1 break-all font-extrabold">
              {student.parent_email ? (
                <a href={`mailto:${student.parent_email}`} className="inline-flex items-center gap-1.5 hover:text-[#3E8F82]">
                  <Mail className="h-4 w-4 shrink-0" />
                  {student.parent_email}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-wide text-[#17324D]/45">Статус</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                  student.active ? "bg-[#9ED9CA]/35 text-[#1F6B5C]" : "bg-[#17324D]/8 text-[#17324D]/60"
                }`}
              >
                {student.active ? "Активен" : "Неактивен"}
              </span>
            </dd>
          </div>
          {student.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-extrabold uppercase tracking-wide text-[#17324D]/45">Бележка</dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-2xl bg-[#F7FAFC] px-4 py-3 font-semibold leading-7">{student.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <PaymentCard
          title="Такса занималня"
          icon={<BookOpen className="h-5 w-5" />}
          paidUntil={student.tuition_to}
          total={student.tuition_total}
          today={today}
          emptyText="Няма записано плащане за занималня."
          buttonLabel="Добави плащане"
          onAdd={() => openCreate("TUITION")}
        />
        <PaymentCard
          title="Кетъринг"
          icon={<UtensilsCrossed className="h-5 w-5" />}
          paidUntil={student.catering_to}
          total={student.catering_total}
          today={today}
          emptyText="Няма записано плащане за кетъринг."
          buttonLabel="Добави плащане за кетъринг"
          onAdd={() => openCreate("CATERING")}
        />
      </div>

      <section aria-labelledby="history" className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="history" className="text-lg font-extrabold text-[#17324D]">
            История на плащанията
          </h2>
          <div className="flex flex-wrap gap-2">
            {HISTORY_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={historyFilter === f.value}
                onClick={() => setHistoryFilter(f.value)}
                className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  historyFilter === f.value ? "bg-[#17324D] text-white" : "bg-[#17324D]/5 text-[#17324D] hover:bg-[#17324D]/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visiblePayments.length === 0 ? (
          <p className="mt-5 rounded-2xl border-2 border-dashed border-[#17324D]/15 px-4 py-10 text-center font-extrabold text-[#17324D]/60">
            Все още няма записани плащания.
          </p>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#17324D]/8 text-xs font-extrabold uppercase tracking-wide text-[#17324D]/50">
                  <tr>
                    <th scope="col" className="py-3 pr-3">Дата</th>
                    <th scope="col" className="px-3 py-3">Тип</th>
                    <th scope="col" className="px-3 py-3 text-right">Сума</th>
                    <th scope="col" className="px-3 py-3">Период</th>
                    <th scope="col" className="px-3 py-3">Метод</th>
                    <th scope="col" className="px-3 py-3">Бележка</th>
                    <th scope="col" className="py-3 pl-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17324D]/6 font-bold text-[#17324D]">
                  {visiblePayments.map((p) => (
                    <tr key={p.id}>
                      <td className="whitespace-nowrap py-3 pr-3 tabular-nums">{formatDateBG(p.payment_date)}</td>
                      <td className="px-3 py-3"><TypeBadge type={p.type} /></td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-extrabold tabular-nums">{formatMoney(p.amount)}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                        {formatDateBG(p.period_from)} – {formatDateBG(p.period_to)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{PAYMENT_METHOD_LABELS[p.payment_method]}</td>
                      <td className="max-w-56 truncate px-3 py-3 text-[#17324D]/70" title={p.notes ?? undefined}>
                        {p.notes || "—"}
                      </td>
                      <td className="py-3 pl-3">
                        <RowActions onEdit={() => setPaymentDialog({ mode: "edit", payment: p })} onDelete={() => setDeleting(p)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 flex flex-col gap-3 md:hidden">
              {visiblePayments.map((p) => (
                <li key={p.id} className="rounded-2xl bg-[#F7FAFC] p-4 text-[#17324D]">
                  <div className="flex items-center justify-between gap-3">
                    <TypeBadge type={p.type} />
                    <span className="text-lg font-extrabold tabular-nums">{formatMoney(p.amount)}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold">
                    Платено на {formatDateBG(p.payment_date)} · {PAYMENT_METHOD_LABELS[p.payment_method]}
                  </p>
                  <p className="text-sm font-bold text-[#17324D]/70">
                    Период: {formatDateBG(p.period_from)} – {formatDateBG(p.period_to)}
                  </p>
                  {p.notes && <p className="mt-1 text-sm font-semibold text-[#17324D]/70">{p.notes}</p>}
                  <div className="mt-3">
                    <RowActions onEdit={() => setPaymentDialog({ mode: "edit", payment: p })} onDelete={() => setDeleting(p)} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <StudentFormDialog
        open={editingStudent}
        onClose={() => setEditingStudent(false)}
        student={student}
        onSaved={() => setToast("Данните на ученика бяха запазени.")}
      />
      <PaymentFormDialog
        studentId={student.id}
        state={paymentDialog}
        onClose={() => setPaymentDialog(null)}
        onSaved={setToast}
      />
      <DeletePaymentDialog
        payment={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => setToast("Плащането беше анулирано.")}
      />
      <DeleteStudentDialog
        student={deletingStudent ? student : null}
        onClose={() => setDeletingStudent(false)}
        onDeleted={() => router.push("/admin/students")}
      />
      <Toast message={toast} onDone={clearToast} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-extrabold uppercase tracking-wide text-[#17324D]/45">{label}</dt>
      <dd className="mt-1 font-extrabold">{value}</dd>
    </div>
  )
}

function TypeBadge({ type }: { type: PaymentType }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
        type === "TUITION" ? "bg-[#17324D]/8 text-[#17324D]" : "bg-[#7BA23F]/15 text-[#4F6B29]"
      }`}
    >
      {PAYMENT_TYPE_LABELS[type]}
    </span>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#17324D]/5 text-[#17324D] transition hover:bg-[#17324D]/10"
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Редактирай плащане</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F27B6B]/15 text-[#C7503F] transition hover:bg-[#F27B6B]/25"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Анулирай плащане</span>
      </button>
    </div>
  )
}

function PaymentCard({
  title,
  icon,
  paidUntil,
  total,
  today,
  emptyText,
  buttonLabel,
  onAdd,
}: {
  title: string
  icon: React.ReactNode
  paidUntil: string | null
  total: string
  today: string
  emptyText: string
  buttonLabel: string
  onAdd: () => void
}) {
  const status = getPaymentStatus(paidUntil, today)
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#17324D]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFB37B]/25">{icon}</span>
          {title}
        </h2>
        <StatusBadge status={status} />
      </div>
      {paidUntil ? (
        <div>
          <p className="text-2xl font-extrabold text-[#17324D] tabular-nums">Платено до: {formatDateBG(paidUntil)}</p>
          <p className="mt-1 font-bold text-[#17324D]/60">
            Общо платено: <span className="tabular-nums text-[#17324D]">{formatMoney(total)}</span>
          </p>
        </div>
      ) : (
        <p className="rounded-2xl bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D]/60">{emptyText}</p>
      )}
      <button type="button" onClick={onAdd} className={`${primaryButton} mt-auto self-start`}>
        <Plus className="h-5 w-5" />
        {buttonLabel}
      </button>
    </section>
  )
}

function DeletePaymentDialog({
  payment,
  onClose,
  onDeleted,
}: {
  payment: Payment | null
  onClose: () => void
  onDeleted: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setError(null)
    onClose()
  }

  return (
    <Modal open={payment !== null} onClose={handleClose} title="Анулиране на плащане">
      {payment && (
        <div className="flex flex-col gap-4">
          <p className="font-bold leading-7 text-[#17324D]/80">
            Сигурни ли сте, че искате да анулирате плащането от {formatDateBG(payment.payment_date)} за{" "}
            {PAYMENT_TYPE_LABELS[payment.type].toLowerCase()} на стойност {formatMoney(payment.amount)}? Записът ще бъде
            скрит от историята и отчетите, но ще остане в архива.
          </p>
          <FormError message={error} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} className={secondaryButton}>
              Отказ
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deletePayment(payment.id)
                  if (!res.ok) {
                    setError(res.error)
                    return
                  }
                  handleClose()
                  onDeleted()
                })
              }
              className={dangerButton}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Анулирай
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
