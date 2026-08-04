import type { Metadata } from "next"
import { PenLine, Calculator, BookOpen, FlaskConical, Crown, Languages } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"

export const metadata: Metadata = {
  title: "Курсове | Хралупата",
  description:
    "Курсове в Хралупата - английски език, засилена математика, БЕЛ, природни науки, шах и писане на домашни за деца от 1 до 7 клас.",
}

const courses = [
  {
    icon: Languages,
    title: "Английски език",
    text: "Игрови уроци по английски, изградени около комуникация, речник и увереност в говоренето.",
  },
  {
    icon: Calculator,
    title: "Засилена математика",
    text: "Допълнителни занимания по математика за деца, които искат повече предизвикателства и стабилна основа.",
  },
  {
    icon: BookOpen,
    title: "Български език и литература",
    text: "Четене с разбиране, правопис и писмено изразяване според учебната програма.",
  },
  {
    icon: FlaskConical,
    title: "Природни науки",
    text: "Любопитство чрез опити и наблюдения - как работи светът около нас.",
  },
  {
    icon: Crown,
    title: "Шах",
    text: "Развиване на логика, концентрация и стратегическо мислене чрез играта на шах.",
  },
  {
    icon: PenLine,
    title: "Писане на домашни",
    text: "Подкрепа при изготвяне на домашните с индивидуален подход към всеки ученик.",
  },
]

export default function KursovePage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="Курсове"
        title="Знания, поднесени"
        highlight="с усмивка"
        text="Освен целодневната занималня, предлагаме и допълнителни курсове, които развиват любопитството и уменията на децата - от езици и математика до шах и природни науки."
        heroImage="/images/room-green-exponent.png"
        heroImageAlt="Класна стая с постер за математика"
      />

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Какво предлагаме" title="Курсове за всяко дете и всеки интерес." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.title}
                  className="group rounded-[28px] border border-brand/10 bg-paper p-7 transition hover:-translate-y-1 hover:border-brand/30"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-soft text-brand-dark transition group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-ink">{c.title}</h3>
                  <p className="mt-2 font-semibold leading-7 text-ink/60">{c.text}</p>
                </div>
              )
            })}
          </div>
          <p className="mt-8 max-w-2xl font-semibold leading-7 text-ink/55">
            Групите са малки, за да получи всяко дете внимание. За график, свободни места и записване се свържете с нас.
          </p>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
