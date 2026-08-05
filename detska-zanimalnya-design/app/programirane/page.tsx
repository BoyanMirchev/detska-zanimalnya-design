import type { Metadata } from "next"
import { Code2, Cpu, Gamepad2, Bot, Users, Clock3, Laptop, Package } from "lucide-react"
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
    text: "Децата се запознават с първите блокове, команди и логиката зад всяка програма.",
  },
  {
    icon: Gamepad2,
    title: "Създаване на игри",
    text: "Учим чрез създаване на собствени малки игри и интерактивни проекти.",
  },
  {
    icon: Bot,
    title: "Роботика",
    text: "Конструиране и оживяване на прости роботи с реални материали и комплекти.",
  },
  {
    icon: Cpu,
    title: "Логическо мислене",
    text: "Алгоритми, последователност и решаване на проблеми стъпка по стъпка.",
  },
]

const details = [
  { icon: Users, title: "Групи до 8 деца", text: "Малки групи за повече внимание към всяко дете." },
  { icon: Clock3, title: "Час и половина", text: "Всеки понеделник от 18:00 до 19:30 ч." },
  { icon: Laptop, title: "Лаптоп в цената", text: "Всяко дете работи на осигурен от нас лаптоп." },
  { icon: Package, title: "Комплект материали", text: "Индивидуален комплект с всички необходими материали." },
]

const prices = [
  { label: "Такса за един месец", price: "85 € / 166,29 лв" },
  {
    label: "Пакетна цена за едно ниво",
    note: "4 модула / 4 месеца",
    price: "310 € / 606,48 лв",
  },
]

export default function ProgramiranePage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="Дигитални умения за деца"
        title="Първи стъпки в света на"
        highlight="програмирането."
        text="Курсът се провежда в малки групи до 8 деца на територията на академията с продължителност час и половина. В цената е включен индивидуален комплект за всяко дете с всички необходими материали и лаптоп."
        image="/images/class-green-lego.png"
        imageAlt="Класна стая с конструктори за занимания по програмиране и роботика"
      />

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Какво учим" title="Учене чрез игра и създаване." />
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-ink/65">
            Заниманията развиват логическото мислене, творчеството и уменията за решаване на проблеми. Стъпка по стъпка
            децата преминават през четири модула, изграждайки едно завършено ниво.
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
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Разписание и цени" title="Как протича курсът." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {details.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.title} className="rounded-[26px] border border-brand/10 bg-cream p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-brand-soft text-brand-dark">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-ink">{d.title}</h3>
                  <p className="mt-2 font-semibold leading-7 text-ink/60">{d.text}</p>
                </div>
              )
            })}
          </div>

          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[30px] border border-brand/15 bg-paper">
            {prices.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between gap-4 px-6 py-5 sm:px-8 ${
                  i % 2 === 1 ? "bg-cream" : "bg-paper"
                }`}
              >
                <div>
                  <p className="font-extrabold text-ink">{row.label}</p>
                  {row.note && <p className="mt-1 text-sm font-semibold text-ink/55">{row.note}</p>}
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-brand/12 px-4 py-2 text-lg font-black text-brand-dark">
                  {row.price}
                </span>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm font-semibold text-ink/50">
            За братя и сестри – 10% намаление от втората такса.
          </p>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
