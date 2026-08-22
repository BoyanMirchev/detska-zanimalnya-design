"use client"

import { useActionState } from "react"
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react"
import { submitRegistration, type RegistrationFormState } from "@/app/actions/registration"
import { PhoneLink } from "@/components/phone-link"
import { contact } from "@/lib/nav"

const initialState: RegistrationFormState = {}

const ageGroups = [
  "Предучилищна група (5-7 год.)",
  "1 – 4 клас",
  "5 – 7 клас",
  "над 8 клас",
]

const services = [
  "Курсовете ни",
  "3-те занимални",
  "Роботика и Програмиране за деца",
  "Курс по чужди езици",
  "Шахмат за деца",
  "Курс по БЕЛ и Математика",
  "Предприемачество и Бизнес финанси",
  "Етикеция и добри обноски",
  "Лятно училище",
  "Друго",
]

const shifts = ["Първа смяна", "Втора смяна", "Целодневна"]

const fieldClass =
  "rounded-2xl border-2 border-brand/10 bg-cream px-4 py-3 font-bold text-ink outline-none transition placeholder:text-ink/35 focus:border-leaf"

export function RegistrationForm() {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState)

  return (
    <section id="zapisvane" className="scroll-mt-24 bg-brand-soft px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-paper/80 px-4 py-2 text-sm font-extrabold text-brand-dark shadow-sm">
            <Sparkles className="h-4 w-4 text-sun" />
            Запитване / Регистрация
          </span>
          <h2 className="text-pretty text-3xl font-black leading-tight text-ink sm:text-4xl">
            Запишете детето си при нас
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-semibold leading-7 text-ink/65">
            Обадете се на{" "}
            <PhoneLink
              href={contact.phonePrimaryHref}
              className="font-extrabold text-brand-dark underline-offset-2 hover:underline"
            >
              {contact.phonePrimary}
            </PhoneLink>{" "}
            и{" "}
            <a href={contact.phoneSecondaryHref} className="font-extrabold text-brand-dark underline-offset-2 hover:underline">
              {contact.phoneSecondary}
            </a>{" "}
            или попълнете формата по-долу:
          </p>
        </div>

        <div className="rounded-[36px] border border-brand/12 bg-paper p-6 soft-shadow sm:p-9">
          {state.success ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-leaf text-white">
                <Check className="h-8 w-8" />
              </span>
              <h3 className="text-2xl font-black text-ink">Благодарим ви!</h3>
              <p className="max-w-md font-semibold leading-7 text-ink/65">
                Получихме вашата заявка и ще се свържем с вас възможно най-скоро.
              </p>
            </div>
          ) : (
            <form action={formAction} className="grid gap-6 lg:grid-cols-2">
              {/* Left column */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-name" className="text-sm font-extrabold text-ink">
                    Име и фамилия на родител <span className="text-berry">*</span>
                  </label>
                  <input id="reg-name" name="name" type="text" required placeholder="Мария Иванова" className={fieldClass} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-child" className="text-sm font-extrabold text-ink">
                    Име и фамилия на детето
                  </label>
                  <input id="reg-child" name="childName" type="text" placeholder="Иван Иванов" className={fieldClass} />
                </div>

                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-1 text-sm font-extrabold text-ink">В каква възрастова група е то?</legend>
                  {ageGroups.map((group) => (
                    <label key={group} className="flex cursor-pointer items-center gap-3 font-bold text-ink/80">
                      <input type="radio" name="ageGroup" value={group} className="h-4 w-4 accent-[var(--brand)]" />
                      {group}
                    </label>
                  ))}
                </fieldset>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-school" className="text-sm font-extrabold text-ink">
                    В кое училище?
                  </label>
                  <input id="reg-school" name="school" type="text" placeholder="напр. 134 СУ" className={fieldClass} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-shift" className="text-sm font-extrabold text-ink">
                    Коя смяна е детето?
                  </label>
                  <select id="reg-shift" name="shift" defaultValue="" className={fieldClass}>
                    <option value="" disabled>
                      Изберете смяна
                    </option>
                    {shifts.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-email" className="text-sm font-extrabold text-ink">
                    Email <span className="text-berry">*</span>
                  </label>
                  <input id="reg-email" name="email" type="email" required placeholder="mail@example.bg" className={fieldClass} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-phone" className="text-sm font-extrabold text-ink">
                    Телефон за връзка <span className="text-berry">*</span>
                  </label>
                  <input id="reg-phone" name="phone" type="tel" required placeholder="0888 123 456" className={fieldClass} />
                </div>

                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-1 text-sm font-extrabold text-ink">Имам интерес към следните услуги:</legend>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {services.map((service) => (
                      <label key={service} className="flex cursor-pointer items-start gap-3 font-bold text-ink/80">
                        <input type="checkbox" name="services" value={service} className="mt-1 h-4 w-4 accent-[var(--brand)]" />
                        {service}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-other" className="text-sm font-extrabold text-ink">
                    Друго / бележка
                  </label>
                  <textarea
                    id="reg-other"
                    name="otherNote"
                    rows={2}
                    placeholder="Допълнителна информация..."
                    className={`resize-none ${fieldClass}`}
                  />
                </div>

                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-1 text-sm font-extrabold text-ink">
                    Желая да получавам актуална информация и предложения
                  </legend>
                  <label className="flex cursor-pointer items-center gap-3 font-bold text-ink/80">
                    <input type="radio" name="newsletter" value="yes" className="h-4 w-4 accent-[var(--brand)]" />
                    Да, желая да получавам информация от Вас
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 font-bold text-ink/80">
                    <input type="radio" name="newsletter" value="no" className="h-4 w-4 accent-[var(--brand)]" />
                    Не, не желая
                  </label>
                </fieldset>
              </div>

              {/* Full width footer */}
              <div className="lg:col-span-2">
                {state.error && (
                  <p className="mb-4 rounded-2xl bg-berry/15 px-4 py-3 text-sm font-extrabold text-berry">{state.error}</p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-lg font-extrabold text-white transition hover:-translate-y-1 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Изпращане...
                    </>
                  ) : (
                    <>
                      Изпращане
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
