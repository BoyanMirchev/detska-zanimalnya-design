import type { Metadata } from "next"
import { Code2, Cpu, Gamepad2, Bot } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"

export const metadata: Metadata = {
  title: "Програмиране | Хралупата",
  description:
    "Занимания по програмиране за деца в Хралупата – логика, творчество и първи стъпки в дигиталния свят.",
}

const features = [
  {
    icon: Code2,
    title: "Основи на кода",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Децата се запознават с първите блокове и команди.",
  },
  {
    icon: Gamepad2,
    title: "Създаване на игри",
    text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua – учим чрез собствени малки игри.",
  },
  {
    icon: Bot,
    title: "Роботика",
    text: "Ut enim ad minim veniam, quis nostrud exercitation – конструиране и оживяване на прости роботи.",
  },
  {
    icon: Cpu,
    title: "Логическо мислене",
    text: "Duis aute irure dolor in reprehenderit – алгоритми, последователност и решаване на проблеми.",
  },
]

export default function ProgramiranePage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="Дигитални умения за деца"
        title="Първи стъпки в света на"
        highlight="програмирането."
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Текстът тук е примерен и ще бъде заменен."
        image="/images/room-green-exponent.png"
        imageAlt="Класна стая, подготвена за занимания по програмиране"
      />

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Какво учим" title="Учене чрез игра и създаване." />
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-ink/65">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.title}
                  className="rounded-[30px] border border-brand/12 bg-paper p-7 transition duration-300 hover:-translate-y-1 hover:border-brand/30"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-[20px] bg-brand-soft text-brand-dark">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-2xl font-extrabold text-ink">{feature.title}</h3>
                  <p className="mt-3 font-semibold leading-7 text-ink/65">{feature.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading align="center" eyebrow="За кого е" title="Подходящо за любопитни малки умове." />
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-semibold leading-8 text-ink/65">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </p>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
