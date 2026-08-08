import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import {
  BookOpen,
  Languages,
  Bot,
  Crown,
  Palette,
  Drama,
  Music,
  PiggyBank,
} from "lucide-react"

import {PageHero, BottomCTA, SectionHeading } from "@/components/sections"

export const metadata: Metadata = {
  title: "Курсове за деца в София",

  description:
    "Курсове за деца в София по английски език, математика, БЕЛ, програмиране и роботика, шах, предприемачество, изкуства и други занимания.",

  alternates: {
    canonical: "/kursove",
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "Курсове за деца в София | Хралупата",
    description:
      "Образователни курсове за деца в София по английски език, математика, програмиране, шах, предприемачество и други направления.",
    url: "/kursove",
  },
}

const courses = [
  {
    icon: BookOpen,
    title: "Български език и математика",
    text: "Преговор на изучените теми, упражнения и практически задачи, подготовка за тестове, правопис, граматика и работа върху конкретните затруднения.",
  },
  {
    icon: Languages,
    title: "Английски език",
    href: "/kursove/angliyski",
    text: "Разговорни упражнения, песни, игри и истории, чрез които развиваме речников запас, разбиране при слушане, произношение и увереност при говорене.",
  },
  {
    icon: Bot,
    title: "Роботика и програмиране",
    href: "/programirane",
    text: "Децата конструират модели и се запознават с основните принципи на програмирането, развивайки логика, концентрация и умения за решаване на проблеми.",
  },
  {
    icon: Crown,
    title: "Шах",
    href: "/kursove/shah",
    text: "Чрез шахматната игра децата се учат да планират, да предвиждат последствията от решенията си и да запазват концентрация. Подходящ за начинаещи и напреднали.",
  },
  {
    icon: Palette,
    title: "Арт занимания",
    text: "В творческите работилници децата работят с различни материали и техники, развивайки въображение, фина моторика и увереност да представят идеите си.",
  },
  {
    icon: Drama,
    title: "Театър и актьорско майсторство",
    text: "Чрез импровизации, ролеви игри и сценични упражнения децата развиват речта, увереността и способността да се изразяват пред публика.",
  },
  {
    icon: Music,
    title: "Музика",
    text: "Предлагаме занимания по пеене, солфеж и инструмент според наличната програма и преподаватели — индивидуално или в група.",
  },
  {
    icon: PiggyBank,
    title: "Финансова грамотност и предприемачество",
    href: "/kursove/predpriemachestvo",
    text: "По достъпен начин запознаваме децата с пари, спестяване, бюджет, цена и реклама чрез практически задачи и работа по малки проекти.",
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
        image="/images/room-green-exponent.png"
        imageAlt="Класна стая с постер за математика"
      />

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Какво предлагаме" title="Курсове за всяко дете и всеки интерес." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
           {courses.map((c) => {
  const Icon = c.icon

  const cardContent = (
    <>
      <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-soft text-brand-dark transition group-hover:bg-brand group-hover:text-white">
        <Icon className="h-7 w-7" />
      </span>

      <h3 className="mt-5 text-xl font-extrabold text-ink">
        {c.title}
      </h3>

      <p className="mt-2 font-semibold leading-7 text-ink/60">
        {c.text}
      </p>

      {c.href && (
        <span className="mt-5 inline-flex items-center font-extrabold text-brand-dark">
          Научи повече →
        </span>
      )}
    </>
  )

  if (c.href) {
    return (
      <Link
        key={c.title}
        href={c.href}
        className="group block rounded-[28px] border border-brand/10 bg-paper p-7 transition hover:-translate-y-1 hover:border-brand/30"
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div
      key={c.title}
      className="group rounded-[28px] border border-brand/10 bg-paper p-7 transition hover:-translate-y-1 hover:border-brand/30"
    >
      {cardContent}
    </div>
  )
})}
          </div>
          <p className="mt-8 max-w-2xl font-semibold leading-7 text-ink/55">
            Групите са малки, за да получи всяко дете внимание. За график, свободни места и записване се свържете с нас.
          </p>
        </div>
      </section>

      {/* Schedule & prices poster */}
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            align="center"
            eyebrow="График и цени"
            title="Разписание и такси на курсовете"
          />
          <p className="mx-auto mt-4 max-w-2xl text-center font-semibold leading-7 text-ink/60">
            Пълна информация за дните, часовете и месечните такси по програмиране, БЕЛ, математика, шах, предприемачество и английски език.
          </p>
          <figure className="mt-10 overflow-hidden rounded-[32px] border-[6px] border-white bg-cream soft-shadow">
            <Image
              src="/images/kursove-poster.png"
              alt="Разписание и цени на курсовете в Хралупата - програмиране, БЕЛ и математика по класове, подготовка за НВО, шах, предприемачество и английски език"
              width={1024}
              height={1560}
              className="h-auto w-full"
            />
          </figure>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
