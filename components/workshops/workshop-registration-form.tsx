"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react"
import { submitWorkshopRegistration, type WorkshopRegistrationState } from "@/app/actions/workshops"
import {
  MAX_NOTES_LENGTH,
  validateWorkshopRegistration,
  type WorkshopRegistrationErrors,
} from "@/lib/workshops/validation"

export type WorkshopOption = { slug: string; title: string; requiresAllergyInfo: boolean; open: boolean }

const inputClass =
  "w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 py-3 font-semibold text-ink outline-none transition placeholder:text-ink/35 focus:border-brand aria-[invalid=true]:border-berry"

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 text-sm font-bold text-berry">
      {message}
    </p>
  )
}

export function WorkshopRegistrationForm({ options, defaultSlug }: { options: WorkshopOption[]; defaultSlug: string }) {
  const [state, formAction, pending] = useActionState<WorkshopRegistrationState, FormData>(submitWorkshopRegistration, {})
  const [selected, setSelected] = useState(defaultSlug)
  const [hasAllergies, setHasAllergies] = useState("")
  const [clientErrors, setClientErrors] = useState<WorkshopRegistrationErrors>({})
  const [startedAt] = useState(() => Date.now())
  const statusRef = useRef<HTMLDivElement>(null)

  const current = options.find((o) => o.slug === selected)
  const requiresAllergyInfo = current?.requiresAllergyInfo ?? false
  const errors = { ...state.fieldErrors, ...clientErrors }

  useEffect(() => {
    if (state.success || state.error) statusRef.current?.focus()
  }, [state])

  if (state.success) {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-center gap-4 rounded-[36px] bg-paper p-10 text-center shadow-sm outline-none"
      >
        <CheckCircle2 className="h-14 w-14 text-leaf" aria-hidden="true" />
        <h3 className="text-2xl font-extrabold text-ink">Благодарим ви! Заявката е получена.</h3>
        <p className="max-w-lg font-semibold leading-7 text-ink/65">
          {`Получихме заявката ви за „${state.workshopTitle}“. Ще се свържем с вас по телефона или имейла, за да потвърдим участието.`}
        </p>
      </div>
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(event.currentTarget)
    const get = (k: string) => String(fd.get(k) ?? "")
    const found = validateWorkshopRegistration(
      {
        parentName: get("parentName"),
        phone: get("phone"),
        email: get("email"),
        childName: get("childName"),
        childAge: get("childAge"),
        workshop: get("workshop"),
        hasAllergies: get("hasAllergies"),
        allergyDetails: get("allergyDetails"),
        consent: fd.get("consent") === "on",
      },
      { requiresAllergyInfo },
    )
    setClientErrors(found)
    if (Object.keys(found).length > 0 || pending) {
      event.preventDefault()
      const first = Object.keys(found)[0]
      if (first) (event.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus?.()
    }
  }

  const describe = (key: keyof WorkshopRegistrationErrors) =>
    errors[key] ? { "aria-invalid": true as const, "aria-describedby": `wr-${key}-error` } : {}

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="relative flex flex-col gap-5 rounded-[36px] bg-paper p-6 shadow-sm sm:p-10">
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="wr-company">Фирма</label>
        <input id="wr-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-3 rounded-2xl bg-berry/10 p-4 font-bold text-berry outline-none"
        >
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="wr-parentName" className="mb-2 block font-extrabold text-ink">
            Име и фамилия на родител
          </label>
          <input id="wr-parentName" name="parentName" autoComplete="name" required className={inputClass} {...describe("parentName")} />
          <FieldError id="wr-parentName-error" message={errors.parentName} />
        </div>
        <div>
          <label htmlFor="wr-phone" className="mb-2 block font-extrabold text-ink">
            Телефон
          </label>
          <input id="wr-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={inputClass} {...describe("phone")} />
          <FieldError id="wr-phone-error" message={errors.phone} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="wr-email" className="mb-2 block font-extrabold text-ink">
            Имейл
          </label>
          <input id="wr-email" name="email" type="email" autoComplete="email" required className={inputClass} {...describe("email")} />
          <FieldError id="wr-email-error" message={errors.email} />
        </div>
        <div>
          <label htmlFor="wr-childName" className="mb-2 block font-extrabold text-ink">
            Име на детето
          </label>
          <input id="wr-childName" name="childName" required className={inputClass} {...describe("childName")} />
          <FieldError id="wr-childName-error" message={errors.childName} />
        </div>
        <div>
          <label htmlFor="wr-childAge" className="mb-2 block font-extrabold text-ink">
            Възраст на детето
          </label>
          <input
            id="wr-childAge"
            name="childAge"
            type="number"
            inputMode="numeric"
            min={1}
            max={18}
            required
            className={inputClass}
            {...describe("childAge")}
          />
          <FieldError id="wr-childAge-error" message={errors.childAge} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="wr-workshop" className="mb-2 block font-extrabold text-ink">
            Избрана работилница
          </label>
          <select
            id="wr-workshop"
            name="workshop"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className={inputClass}
            {...describe("workshop")}
          >
            {options.map((o) => (
              <option key={o.slug} value={o.slug} disabled={!o.open}>
                {o.open ? o.title : `${o.title} (записването не е активно)`}
              </option>
            ))}
          </select>
          <FieldError id="wr-workshop-error" message={errors.workshop} />
        </div>
      </div>

      {requiresAllergyInfo && (
        <fieldset className="rounded-2xl bg-cream p-5" {...describe("hasAllergies")}>
          <legend className="float-left mb-3 w-full font-extrabold text-ink">
            Има ли детето хранителни алергии или непоносимости?
          </legend>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "no", label: "Не" },
              { value: "yes", label: "Да" },
            ].map((o) => (
              <label key={o.value} className="inline-flex cursor-pointer items-center gap-2 font-bold text-ink">
                <input
                  type="radio"
                  name="hasAllergies"
                  value={o.value}
                  checked={hasAllergies === o.value}
                  onChange={(e) => setHasAllergies(e.target.value)}
                  className="h-5 w-5 accent-brand"
                />
                {o.label}
              </label>
            ))}
          </div>
          <FieldError id="wr-hasAllergies-error" message={errors.hasAllergies} />
          {hasAllergies === "yes" && (
            <div className="mt-4">
              <label htmlFor="wr-allergyDetails" className="mb-2 block font-extrabold text-ink">
                Моля, опишете алергиите или непоносимостите
              </label>
              <textarea id="wr-allergyDetails" name="allergyDetails" rows={3} maxLength={500} className={inputClass} {...describe("allergyDetails")} />
              <FieldError id="wr-allergyDetails-error" message={errors.allergyDetails} />
            </div>
          )}
        </fieldset>
      )}

      <div>
        <label htmlFor="wr-notes" className="mb-2 block font-extrabold text-ink">
          Допълнителна информация <span className="font-semibold text-ink/50">(по желание)</span>
        </label>
        <textarea id="wr-notes" name="notes" rows={4} maxLength={MAX_NOTES_LENGTH} className={inputClass} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 font-semibold leading-6 text-ink/75">
          <input type="checkbox" name="consent" className="mt-1 h-5 w-5 shrink-0 accent-brand" {...describe("consent")} />
          <span>
            Съгласен/съгласна съм „Хралупата“ да обработва предоставените лични данни единствено с цел организиране на
            участието в работилницата и връзка с мен във връзка със заявката.
          </span>
        </label>
        <FieldError id="wr-consent-error" message={errors.consent} />
      </div>

      <button
        type="submit"
        disabled={pending || !current?.open}
        className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand px-8 py-4 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
        {pending ? "Изпращане..." : "Изпрати заявка"}
      </button>
    </form>
  )
}
