"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import {
  loginStudent,
  registerStudent,
  requestPasswordRecovery,
  resetPasswordWithToken,
  type FormState,
} from "@/app/actions/english-tests/student"
import { AGE_GROUPS, SCHOOL_GRADES } from "@/lib/english-tests/validation"
import { Alert, Field, inputClass, primaryButton } from "./ui"

const initial: FormState = {}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className={`${primaryButton} mt-2 w-full`}>
      {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
      {label}
    </button>
  )
}

function described(name: string, errors?: Record<string, string>) {
  return errors?.[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {}
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerStudent, initial)
  const e = state.errors
  const v = state.values ?? {}
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Име" htmlFor="firstName" error={e?.firstName}>
          <input id="firstName" name="firstName" defaultValue={v.firstName} required autoComplete="given-name" className={inputClass} {...described("firstName", e)} />
        </Field>
        <Field label="Фамилия" htmlFor="lastName" error={e?.lastName}>
          <input id="lastName" name="lastName" defaultValue={v.lastName} required autoComplete="family-name" className={inputClass} {...described("lastName", e)} />
        </Field>
      </div>
      <Field label="Потребителско име" htmlFor="username" error={e?.username} hint="3–30 знака: латински букви, цифри, точка, тире или долна черта.">
        <input id="username" name="username" defaultValue={v.username} required autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputClass} {...described("username", e)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Парола" htmlFor="password" error={e?.password} hint="Поне 8 знака, с буква и цифра.">
          <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} {...described("password", e)} />
        </Field>
        <Field label="Повтори паролата" htmlFor="confirmPassword" error={e?.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} {...described("confirmPassword", e)} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Клас (по желание)" htmlFor="schoolGrade" error={e?.schoolGrade}>
          <select id="schoolGrade" name="schoolGrade" defaultValue={v.schoolGrade ?? ""} className={inputClass}>
            <option value="">Не посочвам</option>
            {SCHOOL_GRADES.map((g) => (
              <option key={g} value={g}>
                {g === "Предучилищна" ? g : `${g} клас`}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Възраст (по желание)" htmlFor="ageGroup" error={e?.ageGroup}>
          <select id="ageGroup" name="ageGroup" defaultValue={v.ageGroup ?? ""} className={inputClass}>
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
      <Submit pending={pending} label="Създай профил" />
      <p className="text-center text-sm font-bold text-et-navy/70">
        Вече имаш профил?{" "}
        <Link href="/testove/vhod" className="font-extrabold text-et-navy underline underline-offset-4">
          Влез
        </Link>
      </p>
    </form>
  )
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginStudent, initial)
  return (
    <form action={action} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Потребителско име" htmlFor="username">
        <input id="username" name="username" defaultValue={state.values?.username} required autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputClass} />
      </Field>
      <Field label="Парола" htmlFor="password">
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <div className="flex justify-end">
        <Link href="/testove/zabravena-parola" className="text-sm font-extrabold text-et-navy underline underline-offset-4">
          Забравена парола?
        </Link>
      </div>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <Submit pending={pending} label="Вход" />
      <p className="text-center text-sm font-bold text-et-navy/70">
        Нямаш профил?{" "}
        <Link href="/testove/registracia" className="font-extrabold text-et-navy underline underline-offset-4">
          Регистрирай се
        </Link>
      </p>
    </form>
  )
}

export function RecoveryForm() {
  const [state, action, pending] = useActionState(requestPasswordRecovery, initial)
  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">{state.success}</Alert>
        <Link href="/testove/vhod" className="text-center text-sm font-extrabold text-et-navy underline underline-offset-4">
          Обратно към входа
        </Link>
      </div>
    )
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Потребителско име" htmlFor="username">
        <input id="username" name="username" required autoComplete="username" autoCapitalize="none" spellCheck={false} className={inputClass} />
      </Field>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <Submit pending={pending} label="Изпрати заявка" />
    </form>
  )
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordWithToken, initial)
  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">{state.success}</Alert>
        <Link href="/testove/vhod" className={primaryButton}>
          Към входа
        </Link>
      </div>
    )
  }
  const e = state.errors
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <Field label="Нова парола" htmlFor="password" error={e?.password} hint="Поне 8 знака, с буква и цифра.">
        <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} {...described("password", e)} />
      </Field>
      <Field label="Повтори новата парола" htmlFor="confirmPassword" error={e?.confirmPassword}>
        <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} {...described("confirmPassword", e)} />
      </Field>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <Submit pending={pending} label="Смени паролата" />
    </form>
  )
}
