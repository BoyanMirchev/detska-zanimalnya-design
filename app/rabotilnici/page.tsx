import type { Metadata } from "next"
import Image from "next/image"
import { Brain, Hand, Heart, Lightbulb, Users } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { BottomCTA, SectionHeading } from "@/components/sections"
import { Breadcrumbs, FestiveGarland, WorkshopCard } from "@/components/workshops/workshop-parts"
import { getPublishedWorkshops } from "@/lib/workshops/db"

export const revalidate = 300

const description =
  "Коледни работилници за деца в София – писмо до Дядо Коледа, коледни играчки от солено тесто и украсяване на меденки в „Хралупата“."

export const metadata: Metadata = {
  title: "Коледни работилници за деца в София",
  description,
  alternates: { canonical: "/rabotilnici" },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "Коледни работилници за деца в София | Хралупата",
    description,
    url: "/rabotilnici",
    images: [{ url: "/images/rabotilnici/koledni-rabotilnici.png", alt: "Деца творят на празнична коледна работилница" }],
  },
}

const benefits = [
  { icon: Lightbulb, title: "Развитие на творческото мислене" },
  { icon: Brain, title: "Стимулиране на въображението" },
  { icon: Hand, title: "Усъвършенстване на фината моторика" },
  { icon: Users, title: "Нови приятелства" },
  { icon: Heart, title: "Забавление в уютна и подкрепяща среда" },
]

export default async function RabotilniciPage() {
  const workshops = await getPublishedWorkshops()

  return (
    <main>
      <section className="noise relative px-5 pb-16 pt-32 sm:px-8 lg:pt-40">
        <FestiveGarland />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Breadcrumbs items={[{ label: "Начало", href: "/" }, { label: "Работилници" }]} />
            <h1 className="max-w-2xl text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.02em] text-ink text-balance sm:text-6xl">
              Коледни работилници <span className="text-brand">в Хралупата</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-ink/65 text-pretty">
              Подарете на детето си незабравими коледни моменти, изпълнени с творчество, игри, усмивки и празнична магия!
            </p>
            <a
              href="#rabotilnici"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-brand-dark motion-reduce:hover:translate-y-0"
            >
              Разгледай работилниците
            </a>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border-[10px] border-white bg-brand-soft soft-shadow">
              <Image
                src="/images/rabotilnici/koledni-rabotilnici.png"
                alt="Деца творят с коледни материали на празнична работилница в Хралупата"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="rabotilnici" className="scroll-mt-28 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Работилници" title="Изберете празнично приключение" />
          {workshops.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workshops.map((w, i) => (
                <Reveal key={w.id} delay={i * 90} className="h-full">
                  <WorkshopCard workshop={w} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-lg font-semibold text-ink/65">Очаквайте подробности за предстоящите работилници.</p>
          )}
        </div>
      </section>

      <section className="bg-paper/60 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Защо при нас" title="Защо да изберете нашите работилници?" align="center" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map(({ icon: Icon, title }, i) => (
              <Reveal as="li" key={title} delay={i * 70} className="flex flex-col items-center gap-4 rounded-[32px] bg-paper p-7 text-center shadow-sm">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-extrabold leading-snug text-ink text-balance">{title}</h3>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
