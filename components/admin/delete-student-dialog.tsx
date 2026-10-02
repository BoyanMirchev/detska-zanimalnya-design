"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { deleteStudent } from "@/app/actions/students"
import { FormError, Modal, dangerButton, secondaryButton } from "@/components/admin/ui"

export type DeletableStudent = { id: number; first_name: string; last_name: string }

export function DeleteStudentDialog({
  student,
  onClose,
  onDeleted,
}: {
  student: DeletableStudent | null
  onClose: () => void
  onDeleted: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    if (pending) return
    setError(null)
    onClose()
  }

  return (
    <Modal open={student !== null} onClose={handleClose} title="Изтриване на ученик">
      {student && (
        <div className="flex flex-col gap-4">
          <p className="font-bold leading-7 text-[#17324D]/80">
            Сигурни ли сте, че искате да изтриете{" "}
            <span className="font-extrabold text-[#17324D]">
              {student.first_name} {student.last_name}
            </span>
            ? Всички плащания на ученика също ще бъдат изтрити окончателно. Това действие не може да бъде отменено.
          </p>
          <p className="rounded-2xl bg-[#17324D]/5 px-4 py-3 text-sm font-bold text-[#17324D]/70">
            Ако ученикът само е спрял да посещава занималнята, по-добре го направете неактивен чрез „Редактирай“ –
            така историята на плащанията се запазва.
          </p>
          <FormError message={error} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} disabled={pending} className={secondaryButton}>
              Отказ
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteStudent(student.id)
                  if (!res.ok) {
                    setError(res.error)
                    return
                  }
                  setError(null)
                  onClose()
                  onDeleted()
                })
              }
              className={dangerButton}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Изтрий ученика
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
