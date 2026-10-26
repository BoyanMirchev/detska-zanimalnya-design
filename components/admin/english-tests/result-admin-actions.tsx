"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addAdminNote, grantRetake } from "@/app/actions/english-tests/admin"
import { Field, FormError, Toast, inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"
import { formatDateTime } from "./et-shell"

export function ResultAdminActions({
  attemptId,
  studentId,
  testId,
  notes,
}: {
  attemptId: string
  studentId: number
  testId: number
  notes: { id: number; note: string; createdAt: string }[]
}) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>, reset: () => void) =>
    startTransition(async () => {
      setError(null)
      const res = await fn()
      if (!res.ok) return setError(res.error ?? "Възникна грешка.")
      setToast(res.message ?? "Готово.")
      reset()
      router.refresh()
    })

  return (
    <div className="flex flex-col gap-4">
      <FormError message={error} />
      <section className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm" aria-labelledby="retake-title">
        <h2 id="retake-title" className="font-extrabold text-[#17324D]">
          Нов опит
        </h2>
        <p className="text-sm font-bold text-[#17324D]/55">Разрешете на ученика един допълнителен опит за този тест.</p>
        <Field label="Причина (по желание)" htmlFor="retake-reason">
          <input id="retake-reason" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className={inputClass} />
        </Field>
        <button
          type="button"
          disabled={pending}
          className={secondaryButton}
          onClick={() => run(() => grantRetake(studentId, testId, 1, reason), () => setReason(""))}
        >
          Разреши нов опит
        </button>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm" aria-labelledby="notes-title">
        <h2 id="notes-title" className="font-extrabold text-[#17324D]">
          Бележки на администратора
        </h2>
        <Field label="Нова бележка" htmlFor="admin-note">
          <textarea id="admin-note" rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </Field>
        <button
          type="button"
          disabled={pending || !note.trim()}
          className={primaryButton}
          onClick={() => run(() => addAdminNote(attemptId, note), () => setNote(""))}
        >
          Добави бележка
        </button>
        {notes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-2xl bg-[#F7FAFC] px-4 py-3">
                <p className="whitespace-pre-wrap text-sm font-bold text-[#17324D]">{n.note}</p>
                <p className="mt-1 text-xs font-bold text-[#17324D]/50">{formatDateTime(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
