"use client"

import { useState, useTransition, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { createStudent, updateStudent } from "@/app/actions/students"
import type { Student } from "@/lib/students-db"
import { CLASS_OPTIONS, validateStudent, type FieldErrors } from "@/lib/student-validation"
import { Field, FormError, Modal, inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"

export function StudentFormDialog({
  open,
  onClose,
  student,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  student?: Student
  onSaved: (id: number) => void
}) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleClose() {
    setErrors({})
    setFormError(null)
    onClose()
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const input = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      className: fd.get("className"),
      parentName: fd.get("parentName"),
      parentPhone: fd.get("parentPhone"),
      parentEmail: fd.get("parentEmail"),
      notes: fd.get("notes"),
      active: fd.get("active") === "on",
    }
    const { errors: clientErrors } = validateStudent(input)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) {
      setFormError("Моля, попълнете задължителните полета.")
      return
    }
    setFormError(null)
    startTransition(async () => {
      const res = student ? await updateStudent(student.id, input) : await createStudent(input)
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {})
        setFormError(res.error)
        return
      }
      handleClose()
      onSaved(res.id ?? student?.id ?? 0)
    })
  }

  const err = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  })

  return (
    <Modal open={open} onClose={handleClose} title={student ? "Редактирай ученик" : "Добави ученик"}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Име" htmlFor="firstName" error={errors.firstName} required>
            <input id="firstName" name="firstName" defaultValue={student?.first_name} autoFocus className={inputClass} {...err("firstName")} />
          </Field>
          <Field label="Фамилия" htmlFor="lastName" error={errors.lastName} required>
            <input id="lastName" name="lastName" defaultValue={student?.last_name} className={inputClass} {...err("lastName")} />
          </Field>
        </div>
        <Field label="Клас" htmlFor="className" error={errors.className} required>
          <select id="className" name="className" defaultValue={student?.class ?? ""} className={inputClass} {...err("className")}>
            <option value="" disabled>
              Изберете клас
            </option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Име на родител" htmlFor="parentName" error={errors.parentName} required>
          <input id="parentName" name="parentName" defaultValue={student?.parent_name} className={inputClass} {...err("parentName")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Телефон на родител" htmlFor="parentPhone" error={errors.parentPhone} required>
            <input
              id="parentPhone"
              name="parentPhone"
              type="tel"
              inputMode="tel"
              defaultValue={student?.parent_phone}
              placeholder="0888 000 000"
              className={inputClass}
              {...err("parentPhone")}
            />
          </Field>
          <Field label="Имейл на родител" htmlFor="parentEmail" error={errors.parentEmail}>
            <input
              id="parentEmail"
              name="parentEmail"
              type="email"
              defaultValue={student?.parent_email ?? ""}
              placeholder="parent@example.com"
              className={inputClass}
              {...err("parentEmail")}
            />
          </Field>
        </div>
        <Field label="Бележка" htmlFor="notes" error={errors.notes}>
          <textarea id="notes" name="notes" rows={3} defaultValue={student?.notes ?? ""} className={inputClass} {...err("notes")} />
        </Field>
        <label className="inline-flex cursor-pointer items-center gap-3 font-extrabold">
          <input type="checkbox" name="active" defaultChecked={student?.active ?? true} className="h-5 w-5 accent-[#17324D]" />
          Активен ученик
        </label>

        <FormError message={formError} />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleClose} className={secondaryButton}>
            Отказ
          </button>
          <button type="submit" disabled={pending} className={primaryButton}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {student ? "Запази промените" : "Добави ученик"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
