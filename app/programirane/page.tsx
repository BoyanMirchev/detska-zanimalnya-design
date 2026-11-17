import type { Metadata } from "next"
import { Users, Clock3, Laptop, Package } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"
import {
  ProgramiraneContent,
  ProgramiraneEnrollCTA,
  ProgramiraneIntro,
} from "@/components/programirane-content"
import { PricingTable } from "@/components/pricing/pricing-table"

// Prices come from the central pricing table; saves revalidate immediately, this hourly
// refresh rolls date-based promotions over.
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Програмиране и роботика за деца в София",

  description:
    "Курс по програмиране и роботика за деца в София. Малки групи, създаване на игри, основи на програмирането, логика и практически проекти.",

  alternates: {
    canonical: "/programirane",
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "Програмиране и роботика за деца в София | Хралупата",
    description:
      "Курс по програмиране и роботика за деца с практически проекти, създаване на игри и развитие на логическото мислене.",
    url: "/programirane",
  },
}

const details = [
  { icon: Users, title: "Групи до 8 деца", text: "Малки групи за повече внимание към всяко дете." },
  { icon: Clock3, title: "Час и половина", text: "Всеки понеделник от 18:00 до 19:30 ч." },
  { icon: Laptop, title: "Лаптоп в цената", text: "Всяко дете работи на осигурен от нас лаптоп." },
  { icon: Package, title: "Комплект материали", text: "Индивидуален комплект с всички необходими материали." },
]

export default function ProgramiranePage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="Първи стъпки в света на технологиите"
        title="Програмиране за"
        highlight="деца."
        text="Програмирането учи децата не просто как да работят с компютър, а как да мислят логично, да решават проблеми и да превръщат идеите си в работещи проекти."
        image="/images/programirane-deca.png"
        imageAlt="Усмихнати деца програмират на лаптопи с цветни блокове на екрана, а на масата има малък робот и конструктор"
      />

      <ProgramiraneIntro />
      <ProgramiraneContent />

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

          <PricingTable groupKey="kurs-programirane" showHeading={false} className="mx-auto mt-12 max-w-3xl" />
        </div>
      </section>

      <div className="bg-paper pt-4">
        <ProgramiraneEnrollCTA />
      </div>

      <BottomCTA />
    </main>
  )
}
