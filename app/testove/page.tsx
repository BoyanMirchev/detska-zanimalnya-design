import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, ListChecks, Save, Target } from "lucide-react"
import { SectionHeading } from "@/components/sections"
import { getCurrentStudent } from "@/lib/english-tests/auth"
import { getActiveLevelNames } from "@/lib/english-tests/student-data"

export const metadata: Metadata = {
  title: "Онлайн тест по английски – определи нивото си | Хралупата",
  description:
    "Безплатен онлайн входящ тест по английски език в Хралупата. Разбери ориентировъчното ниво на детето – от Pre-A1 до C2 – и следи напредъка след всеки курс.",
  alternates: { canonical: "/testove" },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    title: "Онлайн тест по английски | Хралупата",
    description: "Входящ тест и тестове по нива – от Pre-A1 до C2.",
  },
}

const steps = [
  {
    icon: Target,
    title: "Създай профил",
    text: "Регистрацията отнема минута. Профилът пази всички опити и резултати на едно място.",
  },
  {
    icon: Clock,
    title: "Реши теста",
    text: "Таймерът тече от натискането на „Започни“. Отговорите се запазват автоматично след всеки избор.",
  },
  {
    icon: ListChecks,
    title: "Виж нивото",
    text: "След предаването получаваш резултат и ориентировъчно ниво, а преподавателят – подробен отчет.",
  },
]

export default async function TestoveLandingPage() {
  const [student, levels] = await Promise.all([getCurrentStudent(), getActiveLevelNames()])
  const levelRange = levels.length > 1 ? `от ${levels[0]} до ${levels[levels.length - 1]}` : "по нива"

  return (
    <main>
      <section className="relative px-5 pb-16 pt-32 sm:px-8 lg:pt-40">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-paper/80 px-4 py-2 text-sm font-extrabold text-brand-dark shadow-sm">
              Онлайн тестове по английски
            </span>
            <h1 className="max-w-2xl text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.02em] text-ink text-balance sm:text-6xl">
              Какво ниво по английски е <span className="text-brand">детето?</span>
            </h1>
            <p className="max-w-xl text-lg font-semibold leading-8 text-ink/65 text-pretty">
              Входящият тест дава ориентировъчно ниво {levelRange}, за да започне обучението от правилното място.
              След всяко ниво може да се направи и тест за напредъка.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {student ? (
                <Link
                  href="/testove/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold text-paper transition hover:-translate-y-1 hover:bg-brand-dark"
                >
                  Към моите тестове
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/testove/registracia"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold text-paper transition hover:-translate-y-1 hover:bg-brand-dark"
                  >
                    Регистрирай се и започни
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/testove/vhod"
                    className="inline-flex items-center justify-center rounded-full border-2 border-brand/25 bg-paper px-7 py-4 font-extrabold text-brand-dark transition hover:border-brand"
                  >
                    Имам профил – вход
                  </Link>
                </>
              )}
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Нива">
              {levels.map((l) => (
                <li key={l} className="rounded-full bg-sun/30 px-3 py-1 text-sm font-black text-ink">
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border-[10px] border-paper bg-brand-soft soft-shadow">
              <Image
                src="/images/angliyski-deca.png"
                alt="Деца учат английски в Хралупата"
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <SectionHeading eyebrow="Как работи" title="Три стъпки до ясна препоръка" />
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.title} className="flex flex-col gap-4 rounded-[28px] border border-brand/12 bg-paper p-7 soft-shadow">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand-dark">
                  <s.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-extrabold text-ink">{s.title}</h3>
                <p className="leading-relaxed text-ink/65">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[32px] bg-cream p-8 sm:flex-row sm:items-start sm:gap-6">
          <Save className="h-7 w-7 shrink-0 text-brand-dark" aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold text-ink">Важно за родителите</h2>
            <p className="max-w-3xl leading-relaxed text-ink/70">
              Тестовете с избираем отговор дават предварителна препоръка за ниво и не са официално CEFR сертифициране.
              Окончателното разпределение в група се прави след разговор с преподавателя.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
