import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Check } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"
import { zanimalnyaChildren } from "@/lib/nav"

export type Feature = { icon: LucideIcon; title: string; text: string }
export type PriceRow = { label: string; note?: string; price: string }

export type ProgramPageProps = {
  slug: string
  badge: string
  title: string
  highlight?: string
  heroText: string
  heroImage: string
  heroImageAlt: string
  intro: string
  features: Feature[]
  includes: string[]
  gallery: { src: string; alt: string }[]
  priceTitle: string
  prices: PriceRow[]
}

export function ProgramPage(props: ProgramPageProps) {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge={props.badge}
        title={props.title}
        highlight={props.highlight}
        text={props.heroText}
        image={props.heroImage}
        imageAlt={props.heroImageAlt}
      />

      {/* Program switcher */}
      <div className="px-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
          {zanimalnyaChildren.map((child) => {
            const active = child.href === `/zanimalnya/${props.slug}`
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-brand/20 bg-paper text-ink/70 hover:border-brand/40 hover:text-brand-dark"
                }`}
              >
                {child.short}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Intro + features */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHeading eyebrow="За програмата" title={props.intro} />
            <div className="grid gap-4 sm:grid-cols-2">
              {props.features.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="rounded-[26px] border border-brand/10 bg-paper p-6">
                    <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-brand-soft text-brand-dark">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-xl font-extrabold text-ink">{f.title}</h3>
                    <p className="mt-2 font-semibold leading-7 text-ink/60">{f.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Includes + gallery */}
      <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <SectionHeading eyebrow="Какво включва" title="Всичко необходимо за спокоен ден." />
            <ul className="mt-8 grid gap-3">
              {props.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-cream p-4">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="font-bold text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 grid gap-4 sm:grid-cols-2 lg:order-2">
            {props.gallery.map((img, i) => (
              <div
                key={img.src}
                className={`relative overflow-hidden rounded-[28px] border-4 border-cream ${
                  i === 0 ? "aspect-[4/5] sm:col-span-2 sm:aspect-[16/10]" : "aspect-square"
                }`}
              >
                <Image src={img.src || "/placeholder.svg"} alt={img.alt} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading align="center" eyebrow="Цени" title={props.priceTitle} />
          <div className="mt-10 overflow-hidden rounded-[30px] border border-brand/15 bg-paper">
            {props.prices.map((row, i) => (
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
          <p className="mt-4 text-center text-sm font-semibold text-ink/50">
            За записване и детайли се свържете с нас по телефона или чрез формата за контакт.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/kursove"
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-paper px-6 py-3 font-extrabold text-brand-dark transition hover:border-brand/45"
            >
              Виж и нашите курсове
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
