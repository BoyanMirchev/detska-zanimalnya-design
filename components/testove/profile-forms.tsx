"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { changePassword, updateProfile, type FormState } from "@/app/actions/english-tests/student"
import type { CurrentStudent } from "@/lib/english-tests/auth"
import { AGE_GROUPS, SCHOOL_GRADES } from "@/lib/english-tests/validation"
import { Alert, Field, inputClass, primaryButton } from "./ui"

const initial: FormState = {}

export function ProfileForm({ student }: { student: CurrentStudent }) {
  const [state, action, pending] = useActionState(updateProfile, initial)
  const e = state.errors
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Име" htmlFor="firstName" error={e?.firstName}>
          <input id="firstName" name="firstName" defaultValue={student.firstName} required className={inputClass} />
        </Field>
        <Field label="Фамилия" htmlFor="lastName" error={e?.lastName}>
          <input id="lastName" name="lastName" defaultValue={student.lastName} required className={inputClass} />
        </Field>
        <Field label="Клас" htmlFor="schoolGrade" error={e?.schoolGrade}>
          <select id="schoolGrade" name="schoolGrade" defaultValue={student.schoolGrade ?? ""} className={inputClass}>
            <option value="">Не посочвам</option>
            {SCHOOL_GRADES.map((g) => (
              <option key={g} value={g}>
                {g === "Предучилищна" ? g : `${g} клас`}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Възраст" htmlFor="ageGroup" error={e?.ageGroup}>
          <select id="ageGroup" name="ageGroup" defaultValue={student.ageGroup ?? ""} className={inputClass}>
            <option value="">Не посочвам</option>
            {AGE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <button type="submit" disabled={pending} className={`${primaryButton} w-fit`}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
        Запази
      </button>
    </form>
  )
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial)
  const e = state.errors
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Текуща парола" htmlFor="currentPassword" error={e?.currentPassword}>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Нова парола" htmlFor="password" error={e?.password}>
          <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
        </Field>
        <Field label="Повтори новата парола" htmlFor="confirmPassword" error={e?.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} />
        </Field>
      </div>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <button type="submit" disabled={pending} className={`${primaryButton} w-fit`}>
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
        Смени паролата
      </button>
    </form>
  )
}
