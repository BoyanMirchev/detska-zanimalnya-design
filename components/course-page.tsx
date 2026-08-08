import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, Check } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"
import { kursoveChildren } from "@/lib/nav"

export type CourseHighlight = { icon: LucideIcon; title: string; text: string }
export type CourseModule = { title: string; topics: string[] }
export type CourseScheduleGroup = { label: string; times: string[] }
export type CoursePriceRow = { label: string; note?: string; price: string }

export type CoursePageProps = {
  slug: string
  badge: string
  title: string
  highlight?: string
  heroText: string
  heroImage: string
  heroImageAlt: string
  intro: { eyebrow: string; title: string; paragraphs: string[] }
  highlights?: { eyebrow: string; title: string; items: CourseHighlight[] }
  benefits?: { eyebrow: string; title: string; intro?: string; items: string[] }
  modules?: { eyebrow: string; title: string; items: CourseModule[] }
  schedule?: { eyebrow: string; title: string; note?: string; groups: CourseScheduleGroup[] }
  teacher?: { eyebrow: string; title: string; text: string }
  prices?: CoursePriceRow[]
  priceTitle?: string
  priceNote?: string
}

export function CoursePage(props: CoursePageProps) {
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

      {/* Course switcher */}
      <div className="px-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
          {kursoveChildren.map((child) => {
            const active = child.href === `/kursove/${props.slug}`
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

      {/* Intro */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading eyebrow={props.intro.eyebrow} title={props.intro.title} />
          <div className="mt-7 grid gap-5">
            {props.intro.paragraphs.map((p, i) => (
              <p key={i} className="text-lg font-semibold leading-8 text-ink/65">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      {props.highlights && (
        <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow={props.highlights.eyebrow} title={props.highlights.title} />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {props.highlights.items.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-[28px] border border-brand/10 bg-cream p-7">
                    <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-soft text-brand-dark">
                      <Icon className="h-7 w-7" />
                    </span>
                    <h3 className="mt-5 text-xl font-extrabold text-ink">{item.title}</h3>
                    <p className="mt-2 font-semibold leading-7 text-ink/60">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Benefits list */}
      {props.benefits && (
        <section className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <SectionHeading eyebrow={props.benefits.eyebrow} title={props.benefits.title} />
            {props.benefits.intro && (
              <p className="mt-4 max-w-2xl font-semibold leading-7 text-ink/60">{props.benefits.intro}</p>
            )}
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {props.benefits.items.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl border border-brand/10 bg-paper p-4">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="font-bold text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Modules */}
      {props.modules && (
        <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow={props.modules.eyebrow} title={props.modules.title} />
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {props.modules.items.map((mod, i) => (
                <article key={mod.title} className="rounded-[28px] border border-brand/12 bg-cream p-7">
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand/12 px-3 py-1 text-xs font-black uppercase tracking-wide text-brand-dark">
                    Модул {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold text-ink">{mod.title}</h3>
                  <ul className="mt-4 grid gap-2">
                    {mod.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2 font-semibold leading-7 text-ink/65">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Schedule */}
      {props.schedule && (
        <section className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow={props.schedule.eyebrow} title={props.schedule.title} />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {props.schedule.groups.map((group) => (
                <div key={group.label} className="rounded-[26px] border border-brand/12 bg-paper p-6">
                  <p className="text-lg font-extrabold text-ink">{group.label}</p>
                  <ul className="mt-3 grid gap-1.5">
                    {group.times.map((t) => (
                      <li key={t} className="font-semibold text-ink/65">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {props.schedule.note && (
              <p className="mt-6 text-sm font-semibold text-ink/50">{props.schedule.note}</p>
            )}
          </div>
        </section>
      )}

      {/* Teacher */}
      {props.teacher && (
        <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl rounded-[36px] bg-ink p-8 text-white sm:p-12 lg:p-16">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-sun">{props.teacher.eyebrow}</p>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{props.teacher.title}</h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-white/75">{props.teacher.text}</p>
          </div>
        </section>
      )}

      {/* Pricing */}
      {props.prices && props.prices.length > 0 && (
        <section className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <SectionHeading align="center" eyebrow="Цени" title={props.priceTitle ?? "Цени и записване"} />
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
            {props.priceNote && (
              <p className="mt-4 text-center text-sm font-semibold text-ink/50">{props.priceNote}</p>
            )}
            <div className="mt-8 flex justify-center">
              <Link
                href="/kursove"
                className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-paper px-6 py-3 font-extrabold text-brand-dark transition hover:border-brand/45"
              >
                Всички курсове
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <BottomCTA />
    </main>
  )
}
