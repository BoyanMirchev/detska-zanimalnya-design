"use client"

import { useEffect, useRef, useState } from "react"
import { useActionState } from "react"
import { ArrowRight, Check, Loader2, X } from "lucide-react"
import { submitContactRequest, type ContactFormState } from "@/app/actions/contact"
import { validateContact, type ContactErrors, type ContactFields } from "@/lib/contact-validation"

// Palette (orange treehouse theme):
//   #3B2416 ink/brown, #DD5B26 brand orange, #7BA23F leaf, #F4B63F sun

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

const initialState: ContactFormState = {}

const emptyFields: ContactFields = { name: "", email: "", phone: "", childAge: "", message: "" }
type FieldName = keyof ContactFields

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ContactDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(submitContactRequest, initialState)

  // Controlled values + which fields the user has interacted with. We only show
  // an error once a field is "touched" so the modal never opens covered in red.
  const [fields, setFields] = useState<ContactFields>(emptyFields)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})

  const errors: ContactErrors = validateContact(fields)
  const isFormValid = Object.keys(errors).length === 0

  const leadFiredRef = useRef(false)

  function updateField(name: FieldName, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }))
  }

  function markTouched(name: FieldName) {
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }))
  }

  // Reset the form back to a clean state whenever the modal is closed.
  useEffect(() => {
    if (!open) {
      setFields(emptyFields)
      setTouched({})
      leadFiredRef.current = false
    }
  }, [open])

  // Fire the Meta "Lead" conversion ONLY after the server action reported
  // success. Never fires on validation errors, disabled clicks, or failures.
  useEffect(() => {
    if (!state.success || leadFiredRef.current) return
    leadFiredRef.current = true

    // One id shared by browser Pixel + server CAPI -> Meta deduplicates them.
    const eventId = createEventId()
    const eventSourceUrl = typeof window !== "undefined" ? window.location.href : undefined

    try {
      window.fbq?.("track", "Lead", {}, { eventID: eventId })
    } catch {
      // Pixel issues must never affect the success UX.
    }

    void fetch("/api/meta/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: "Lead", eventId, eventSourceUrl }),
      keepalive: true,
    }).catch(() => {
      // Server-side tracking is best-effort only.
    })
  }, [state.success])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-[#3B2416] transition hover:-translate-y-1"
      >
        Пиши ни съобщение
        <ArrowRight className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#3B2416]/50 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Затвори"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3B2416]/5 text-[#3B2416] transition hover:bg-[#3B2416]/10"
            >
              <X className="h-5 w-5" />
            </button>

            {state.success ? (
              <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#7BA23F] text-[#3B2416]">
                  <Check className="h-7 w-7" />
                </span>
                <h2 className="text-2xl font-extrabold text-[#3B2416]">Благодарим ви!</h2>
                <p className="max-w-sm font-bold leading-7 text-[#3B2416]/65">
                  Получихме вашето съобщение и ще се свържем с вас възможно най-скоро.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-flex items-center justify-center rounded-full bg-[#DD5B26] px-7 py-3 font-extrabold text-white transition hover:-translate-y-1 hover:bg-[#B8441A]"
                >
                  Затвори
                </button>
              </div>
            ) : (
              <div className="px-5 py-6 sm:px-6">
                <h2 id="contact-dialog-title" className="text-2xl font-extrabold text-[#3B2416]">
                  Оставете ни съобщение
                </h2>
                <p className="mt-1.5 text-sm font-bold leading-6 text-[#3B2416]/60">
                  Попълнете формата и ще ви отговорим възможно най-бързо.
                </p>

                <form action={formAction} className="mt-5 flex flex-col gap-3.5" noValidate>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-extrabold text-[#3B2416]">
                      Име и фамилия <span className="text-[#F27B6B]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={fields.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      onBlur={() => markTouched("name")}
                      aria-invalid={touched.name && !!errors.name}
                      placeholder="Мария Иванова"
                      className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                    />
                    {touched.name && errors.name && (
                      <p className="text-sm font-bold text-[#C7503F]">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-sm font-extrabold text-[#3B2416]">
                        Имейл <span className="text-[#F27B6B]">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={fields.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        onBlur={() => markTouched("email")}
                        aria-invalid={touched.email && !!errors.email}
                        placeholder="mail@example.bg"
                        className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                      />
                      {touched.email && errors.email && (
                        <p className="text-sm font-bold text-[#C7503F]">{errors.email}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-sm font-extrabold text-[#3B2416]">
                        Телефон <span className="text-[#F27B6B]">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={fields.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        onBlur={() => markTouched("phone")}
                        aria-invalid={touched.phone && !!errors.phone}
                        placeholder="0888 123 456"
                        className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                      />
                      {touched.phone && errors.phone && (
                        <p className="text-sm font-bold text-[#C7503F]">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="childAge" className="text-sm font-extrabold text-[#3B2416]">
                      Възраст на детето <span className="text-[#F27B6B]">*</span>
                    </label>
                    <input
                      id="childAge"
                      name="childAge"
                      type="number"
                      inputMode="numeric"
                      min={6}
                      max={14}
                      step={1}
                      required
                      value={fields.childAge}
                      onChange={(e) => updateField("childAge", e.target.value)}
                      onBlur={() => markTouched("childAge")}
                      aria-invalid={touched.childAge && !!errors.childAge}
                      placeholder="напр. 8"
                      className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                    />
                    {touched.childAge && errors.childAge && (
                      <p className="text-sm font-bold text-[#C7503F]">{errors.childAge}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-sm font-extrabold text-[#3B2416]">
                      Съобщение <span className="text-[#F27B6B]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={3}
                      value={fields.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      onBlur={() => markTouched("message")}
                      aria-invalid={touched.message && !!errors.message}
                      placeholder="Разкажете ни какво търсите..."
                      className="resize-none rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                    />
                    {touched.message && errors.message && (
                      <p className="text-sm font-bold text-[#C7503F]">{errors.message}</p>
                    )}
                  </div>

                  {state.error && (
                    <p className="rounded-2xl bg-[#F27B6B]/15 px-4 py-2.5 text-sm font-extrabold text-[#C7503F]">
                      {state.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pending || !isFormValid}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#DD5B26] px-7 py-3.5 font-extrabold text-white transition hover:-translate-y-1 hover:bg-[#B8441A] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Изпращане...
                      </>
                    ) : (
                      <>
                        Изпрати съобщение
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
