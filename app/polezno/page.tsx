import type { Metadata } from "next"
import Image from "next/image"
import { Clock, Backpack, Utensils, HeartHandshake } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"

export const metadata: Metadata = {
  title: "Информация за родители",

  description:
    "Полезна информация за родители за занималня Хралупата в София – работно време, дневен режим, храна, транспорт, цени и често задавани въпроси.",

  alternates: {
    canonical: "/polezno",
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "Информация за родители | Хралупата",
    description:
      "Работно време, дневен режим, храна, транспорт, цени и отговори на често задавани въпроси.",
    url: "/polezno",
  },
}

const schedule = [
  { time: "7:30 – 8:30", label: "Пристигане и свободна игра" },
  { time: "8:30 – 12:00", label: "Учебни занимания и курсове" },
  { time: "12:00 – 13:00", label: "Обяд" },
  { time: "13:00 – 15:00", label: "Почивка и творчески ателиета" },
  { time: "15:00 – 17:00", label: "Домашни и индивидуална подкрепа" },
  { time: "17:00 – 19:00", label: "Игри и изпращане" },
]

const bring = [
  "Удобни дрехи и обувки за игра",
  "Бутилка за вода",
  "Учебници и тетрадки (за учениците)",
  "Резервни дрехи за най-малките",
]

const faq = [
  {
    q: "От колко до колко часа работите?",
    a: "Работното време е от 7:30 до 19:00 ч. в делнични дни, целогодишно, включително през ваканциите.",
  },
  {
    q: "За каква възраст е занималнята?",
    a: "Приемаме деца от предучилищна група 5–7 години и ученици от 1 до 7 клас.",
  },
  {
    q: "Осигурявате ли храна и транспорт?",
    a: "Да - предлагаме топла храна (кетъринг) и организиран транспорт при необходимост.",
  },
  {
    q: "Мога ли да запиша дете само за няколко дни или часове?",
    a: "Да, имаме гъвкави седмични, дневни и почасови такси за всички програми.",
  },
  {
    q: "Помагате ли с всички домашни работи?",
    a: "Работим по основните учебни предмети и съдействаме за подготовката на домашните. При специализирани задачи или проекти предварително уточняваме каква помощ е необходима.",
  },
  {
    q: "Как се извършва записването?",
    a: "След изпращане на запитване провеждаме кратък разговор с родителя, уточняваме потребностите на детето и проверяваме наличните места.",
  },
  {
    q: "Как информирате родителите за напредъка?",
    a: "Поддържаме редовна комуникация и даваме обратна връзка относно подготовката, трудностите, поведението и адаптацията на детето.",
  },
]

export default function PoleznoPage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="Полезно"
        title="Всичко важно"
        highlight="на едно място"
        text="Събрахме отговорите на най-честите въпроси на родителите - работно време, дневен режим, какво да носи детето и как протича денят в Хралупата."
        image="/images/room-alphabet.png"
        imageAlt="Класна стая с азбука на стената"
      />

      {/* Quick info */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Основна информация" title="Няколко неща, които е добре да знаете." />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            {/* Daily schedule */}
            <div className="rounded-[30px] border border-brand/10 bg-paper p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-brand-soft text-brand-dark">
                  <Clock className="h-6 w-6" />
                </span>
                <h3 className="text-2xl font-extrabold text-ink">Примерен дневен режим</h3>
              </div>
              <ul className="mt-6 grid gap-2">
                {schedule.map((s) => (
                  <li
                    key={s.time}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-cream px-5 py-4"
                  >
                    <span className="font-black text-brand-dark">{s.time}</span>
                    <span className="text-right font-bold text-ink/70">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to bring + care */}
            <div className="grid gap-5">
              <div className="rounded-[30px] border border-brand/10 bg-paper p-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-leaf/15 text-leaf-dark">
                    <Backpack className="h-6 w-6" />
                  </span>
                  <h3 className="text-2xl font-extrabold text-ink">Какво да носи детето</h3>
                </div>
                <ul className="mt-5 grid gap-2">
                  {bring.map((b) => (
                    <li key={b} className="flex items-start gap-3 font-bold text-ink/75">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] bg-brand p-6 text-white">
                  <Utensils className="h-7 w-7" />
                  <p className="mt-3 text-lg font-extrabold leading-tight">Топла храна и закуски</p>
                  <p className="mt-1 text-sm font-semibold text-white/85">Осигурен кетъринг всеки ден.</p>
                </div>
                <div className="rounded-[26px] bg-sun p-6 text-ink">
                  <HeartHandshake className="h-7 w-7" />
                  <p className="mt-3 text-lg font-extrabold leading-tight">Индивидуален подход</p>
                  <p className="mt-1 text-sm font-semibold text-ink/70">Внимание към всяко дете.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full price list poster */}
      <section className="px-5 pb-4 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            align="center"
            eyebrow="Цени"
            title="Пълен ценоразпис"
          />
          <p className="mx-auto mt-4 max-w-2xl text-center font-semibold leading-7 text-ink/60">
            Всички такси за учебна и лятна занималня, ясла и детска градина и предучилищна група - месечни, седмични, дневни и почасови.
          </p>
          <figure className="mt-10 overflow-hidden rounded-[32px] border-[6px] border-white bg-cream soft-shadow">
            <Image
              src="/images/pricing-poster.png"
              alt="Ценоразпис на Хралупата - такси за учебна занималня 1-7 клас, лятна занималня, ясла и детска градина и предучилищна група"
              width={1024}
              height={1536}
              className="h-auto w-full"
            />
          </figure>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading align="center" eyebrow="Въпроси и отговори" title="Често задавани въпроси" />
          <div className="mt-10 grid gap-4">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-[24px] border border-brand/12 bg-cream p-6 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 text-lg font-extrabold text-ink marker:hidden">
                  {item.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/12 text-xl font-black text-brand-dark transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 font-semibold leading-7 text-ink/65">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
