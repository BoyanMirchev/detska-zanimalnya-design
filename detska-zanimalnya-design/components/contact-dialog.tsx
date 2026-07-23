"use client"

import { useActionState, useEffect, useState } from "react"
import { ArrowRight, Check, Loader2, X } from "lucide-react"
import { submitContactRequest, type ContactFormState } from "@/app/actions/contact"

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
        className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-[#17324D] transition hover:-translate-y-1"
      >
        Пиши ни съобщение
        <ArrowRight className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#17324D]/50 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Затвори"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#17324D]/5 text-[#17324D] transition hover:bg-[#17324D]/10"
            >
              <X className="h-5 w-5" />
            </button>

            {state.success ? (
              <div className="flex flex-col items-center gap-4 px-8 py-14 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#9ED9CA] text-[#17324D]">
                  <Check className="h-8 w-8" />
                </span>
                <h2 className="text-2xl font-extrabold text-[#17324D]">Благодарим ви!</h2>
                <p className="max-w-sm font-bold leading-7 text-[#17324D]/65">
                  Получихме вашето съобщение и ще се свържем с вас възможно най-скоро.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-[#17324D] px-7 py-3 font-extrabold text-white transition hover:-translate-y-1"
                >
                  Затвори
                </button>
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FFB37B]/20 px-4 py-1.5 text-sm font-extrabold text-[#17324D]">
                  Свържете се с нас
                </span>
                <h2 id="contact-dialog-title" className="mt-4 text-2xl font-extrabold text-[#17324D] sm:text-3xl">
                  Оставете ни съобщение
                </h2>
                <p className="mt-2 font-bold leading-7 text-[#17324D]/60">
                  Попълнете формата и ние ще ви отговорим възможно най-бързо.
                </p>

                <form action={formAction} className="mt-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-extrabold text-[#17324D]">
                      Име и фамилия <span className="text-[#F27B6B]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Мария Иванова"
                      className="rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D] outline-none transition placeholder:text-[#17324D]/35 focus:border-[#9ED9CA]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm font-extrabold text-[#17324D]">
                        Имейл <span className="text-[#F27B6B]">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="mail@example.bg"
                        className="rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D] outline-none transition placeholder:text-[#17324D]/35 focus:border-[#9ED9CA]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone" className="text-sm font-extrabold text-[#17324D]">
                        Телефон
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="0888 123 456"
                        className="rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D] outline-none transition placeholder:text-[#17324D]/35 focus:border-[#9ED9CA]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="childAge" className="text-sm font-extrabold text-[#17324D]">
                      Възраст на детето
                    </label>
                    <input
                      id="childAge"
                      name="childAge"
                      type="text"
                      placeholder="напр. 6 години / 1. клас"
                      className="rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D] outline-none transition placeholder:text-[#17324D]/35 focus:border-[#9ED9CA]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-sm font-extrabold text-[#17324D]">
                      Съобщение <span className="text-[#F27B6B]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Разкажете ни какво търсите..."
                      className="resize-none rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D] outline-none transition placeholder:text-[#17324D]/35 focus:border-[#9ED9CA]"
                    />
                  </div>

                  {state.error && (
                    <p className="rounded-2xl bg-[#F27B6B]/15 px-4 py-3 text-sm font-extrabold text-[#C7503F]">
                      {state.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pending}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#17324D] px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
