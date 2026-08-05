"use client"

import { useEffect, useState } from "react"
import { useActionState } from "react"
import { ArrowRight, Check, Loader2, X } from "lucide-react"
import { submitContactRequest, type ContactFormState } from "@/app/actions/contact"

// Palette (orange treehouse theme):
//   #3B2416 ink/brown, #DD5B26 brand orange, #7BA23F leaf, #F4B63F sun

const initialState: ContactFormState = {}

export function ContactDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(submitContactRequest, initialState)

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

                <form action={formAction} className="mt-5 flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-extrabold text-[#3B2416]">
                      Име и фамилия <span className="text-[#F27B6B]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Мария Иванова"
                      className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                    />
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
                        placeholder="mail@example.bg"
                        className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-sm font-extrabold text-[#3B2416]">
                        Телефон
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="0888 123 456"
                        className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="childAge" className="text-sm font-extrabold text-[#3B2416]">
                      Възраст на детето
                    </label>
                    <input
                      id="childAge"
                      name="childAge"
                      type="text"
                      placeholder="напр. 6 години / 1. клас"
                      className="rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                    />
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
                      placeholder="Разкажете ни какво търсите..."
                      className="resize-none rounded-2xl border-2 border-[#3B2416]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#3B2416] outline-none transition placeholder:text-[#3B2416]/35 focus:border-[#7BA23F]"
                    />
                  </div>

                  {state.error && (
                    <p className="rounded-2xl bg-[#F27B6B]/15 px-4 py-2.5 text-sm font-extrabold text-[#C7503F]">
                      {state.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pending}
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
