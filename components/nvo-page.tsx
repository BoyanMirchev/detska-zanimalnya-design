import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, BookOpen, Calculator, Check, Phone, Sparkles } from "lucide-react"
import { SectionHeading } from "@/components/sections"
import { CourseSwitcher } from "@/components/course-page"
import { ContactDialog } from "@/components/contact-dialog"
import { PhoneLink } from "@/components/phone-link"
import { Reveal } from "@/components/reveal"
import { contact } from "@/lib/nav"

const ENROLL_HREF = "#zapisvane"

export type NvoSubject = {
  title: string
  lead?: string
  topics: string[]
  note: string
}

export type NvoSection =
  | {
      type: "text"
      eyebrow: string
      title: string
      paragraphs: string[]
    }
  | {
      type: "subjects"
      math: NvoSubject
      bel: NvoSubject
    }
  | {
      type: "pair"
      items: { icon: LucideIcon; eyebrow: string; title: string; paragraphs: string[] }[]
    }
  | {
      type: "checklist"
      eyebrow: string
      title: string
      paragraphs?: string[]
      items: string[]
      closing?: string
    }
  | {
      type: "analysis"
      eyebrow: string
      title: string
      paragraphs: string[]
      listIntro: string
      items: string[]
      closing: string
    }
  | {
      type: "steps"
      eyebrow: string
      title: string
      steps: { title: string; text: string }[]
    }
  | {
      type: "goals"
      eyebrow: string
      title: string
      items: { icon: LucideIcon; text: string }[]
    }

export type NvoPageProps = {
  slug: string
  grade: string
  heroText: string
  heroCta: string
  heroImage: string
  heroImageAlt: string
  sections: NvoSection[]
  finalCta: { title: string; text: string; cta: string }
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-brand/10 bg-paper p-4">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
      </span>
      <span className="font-bold leading-6 text-ink/80">{children}</span>
    </li>
  )
}

function NvoHero({ grade, text, cta, image, imageAlt }: { grade: string; text: string; cta: string; image: string; imageAlt: string }) {
  return (
    <section className="noise relative px-5 pb-16 pt-32 sm:px-8 lg:pt-40">
      <div className="animate-float absolute -left-28 top-40 h-72 w-72 rounded-full bg-sun/20 blur-3xl" />
      <div className="animate-float-slow absolute -right-24 top-16 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="animate-pop mb-6 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-paper/80 px-4 py-2 text-sm font-extrabold text-brand-dark shadow-sm">
            <Sparkles className="h-4 w-4 text-sun" aria-hidden="true" />
            НВО {grade} клас
          </div>
          <h1 className="max-w-2xl text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.02em] text-ink sm:text-6xl">
            Подготовка за{" "}
            <span className="relative inline-block whitespace-nowrap text-brand">
              НВО {grade} клас
              <svg className="absolute -bottom-5 left-0 w-full" viewBox="0 0 330 22" fill="none" aria-hidden="true">
                <path d="M4 14C78 2 221 2 326 13" stroke="#F4B63F" strokeWidth="9" strokeLinecap="round" />
              </svg>
            </span>{" "}
            <span className="mt-8 block text-2xl leading-tight tracking-tight text-ink/80 sm:text-3xl text-balance">
              по математика и български език и литература
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-ink/65 text-pretty">{text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={ENROLL_HREF}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              {cta}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <PhoneLink
              href={contact.phonePrimaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/25 bg-paper px-7 py-4 font-extrabold text-brand-dark transition hover:-translate-y-1 hover:border-brand/45"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              {contact.phonePrimary}
            </PhoneLink>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="animate-bob absolute -right-4 -top-4 z-10 grid h-16 w-16 place-items-center rounded-full bg-sun text-ink shadow-lg">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="animate-float absolute -bottom-5 -left-5 z-10 h-14 w-14 rounded-2xl bg-leaf/90 shadow-lg" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border-[10px] border-white bg-brand-soft soft-shadow">
            <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 90vw, 520px" className="object-cover" priority />
          </div>
        </div>
      </div>
    </section>
  )
}

function SubjectCard({ subject, icon: Icon, label }: { subject: NvoSubject; icon: LucideIcon; label: string }) {
  return (
    <article className="flex h-full flex-col rounded-[32px] border border-brand/12 bg-cream p-7 sm:p-9">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-soft text-brand-dark">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <span className="text-sm font-black uppercase tracking-[0.22em] text-brand-dark">{label}</span>
      </div>
      <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl text-balance">
        {subject.title}
      </h2>
      {subject.lead && <p className="mt-4 font-semibold leading-7 text-ink/65">{subject.lead}</p>}
      <ul className="mt-6 flex flex-wrap gap-2">
        {subject.topics.map((topic) => (
          <li
            key={topic}
            className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-paper px-4 py-2 text-sm font-extrabold text-ink/80"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            {topic}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <p className="rounded-2xl bg-sun/20 px-5 py-4 font-bold leading-7 text-ink/80">{subject.note}</p>
      </div>
    </article>
  )
}

function renderSection(section: NvoSection, index: number) {
  const bg = index % 2 === 1 ? "bg-paper" : ""

  switch (section.type) {
    case "text":
      return (
        <section key={index} className={`${bg} px-5 py-20 sm:px-8 lg:py-24`}>
          <div className="mx-auto max-w-4xl">
            <SectionHeading eyebrow={section.eyebrow} title={section.title} />
            <div className="mt-7 grid gap-5">
              {section.paragraphs.map((p) => (
                <p key={p} className="text-lg font-semibold leading-8 text-ink/65 text-pretty">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      )

    case "subjects":
      return (
        <section key={index} className={`${bg} px-5 py-20 sm:px-8 lg:py-24`}>
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <Reveal className="h-full">
              <SubjectCard subject={section.math} icon={Calculator} label="Математика" />
            </Reveal>
            <Reveal className="h-full" delay={120}>
              <SubjectCard subject={section.bel} icon={BookOpen} label="Български език" />
            </Reveal>
          </div>
        </section>
      )

    case "pair":
      return (
        <section key={index} className={`${bg} px-5 py-20 sm:px-8 lg:py-24`}>
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
            {section.items.map((item, i) => {
              const Icon = item.icon
              return (
                <Reveal key={item.title} delay={i * 120} className="h-full">
                  <article className="h-full rounded-[32px] border border-brand/12 bg-cream p-7 sm:p-9">
                    <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-soft text-brand-dark">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-brand-dark">{item.eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-ink text-balance">
                      {item.title}
                    </h2>
                    <div className="mt-5 grid gap-4">
                      {item.paragraphs.map((p) => (
                        <p key={p} className="font-semibold leading-7 text-ink/65 text-pretty">
                          {p}
                        </p>
                      ))}
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </section>
      )

    case "checklist":
      return (
        <section key={index} className={`${bg} px-5 py-20 sm:px-8 lg:py-24`}>
          <div className="mx-auto max-w-4xl">
            <SectionHeading eyebrow={section.eyebrow} title={section.title} />
            {section.paragraphs?.map((p) => (
              <p key={p} className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-ink/65 text-pretty">
                {p}
              </p>
            ))}
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
            {section.closing && (
              <p className="mt-8 text-lg font-extrabold leading-8 text-brand-dark text-pretty">{section.closing}</p>
            )}
          </div>
        </section>
      )

    case "analysis":
      return (
        <section key={index} className={`${bg} px-5 py-20 sm:px-8 lg:py-24`}>
          <div className="mx-auto grid max-w-6xl gap-10 rounded-[36px] bg-ink p-8 text-white sm:p-12 lg:grid-cols-[1fr_1fr] lg:p-16">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-sun">{section.eyebrow}</p>
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl text-balance">{section.title}</h2>
              <div className="mt-6 grid gap-4">
                {section.paragraphs.map((p) => (
                  <p key={p} className="text-lg font-semibold leading-8 text-white/75 text-pretty">
                    {p}
                  </p>
                ))}
              </div>
              <p className="mt-6 text-lg font-extrabold leading-8 text-sun text-pretty">{section.closing}</p>
            </div>
            <div>
              <p className="font-extrabold text-white">{section.listIntro}</p>
              <ul className="mt-4 grid gap-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sun text-ink">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="font-bold leading-6 text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )

    case "steps":
      return (
        <section key={index} className={`${bg} px-5 py-20 sm:px-8 lg:py-24`}>
          <div className="mx-auto max-w-7xl">
            <SectionHeading align="center" eyebrow={section.eyebrow} title={section.title} />
            <ol className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
              <span
                className="absolute left-0 right-0 top-7 hidden h-1 rounded-full bg-brand/15 lg:block"
                aria-hidden="true"
              />
              {section.steps.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 100} className="relative">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-4 border-cream bg-brand text-xl font-black text-white shadow-lg">
                    {i + 1}
                  </span>
                  <div className="mt-5 rounded-[26px] border border-brand/12 bg-cream p-6">
                    <h3 className="text-lg font-extrabold leading-snug text-ink">{step.title}</h3>
                    <p className="mt-2 font-semibold leading-7 text-ink/60">{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )

    case "goals":
      return (
        <section key={index} className={`${bg} px-5 py-20 sm:px-8 lg:py-24`}>
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow={section.eyebrow} title={section.title} />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {section.items.map((item, i) => {
                const Icon = item.icon
                return (
                  <Reveal as="li" key={item.text} delay={i * 80} className="rounded-[28px] border border-brand/10 bg-cream p-6">
                    <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-brand-soft text-brand-dark">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <p className="mt-5 text-lg font-extrabold leading-snug text-ink">{item.text}</p>
                  </Reveal>
                )
              })}
            </ul>
          </div>
        </section>
      )
  }
}

function NvoFinalCta({ title, text, cta }: { title: string; text: string; cta: string }) {
  return (
    <section className="px-5 pb-24 pt-8 sm:px-8 lg:pb-32">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[44px] bg-brand px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
        <div className="animate-spin-slow absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-white/15" />
        <div className="animate-float absolute -bottom-24 left-[35%] h-56 w-56 rotate-12 rounded-[60px] bg-sun/30" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="max-w-3xl text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl text-balance">
              {title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white/85 text-pretty">{text}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={ENROLL_HREF}
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 text-center font-extrabold text-white transition hover:-translate-y-1"
            >
              {cta}
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </a>
            <PhoneLink
              href={contact.phonePrimaryHref}
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-brand-dark transition hover:-translate-y-1"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              {contact.phonePrimary}
            </PhoneLink>
            <ContactDialog />
          </div>
        </div>
      </div>
    </section>
  )
}

export function NvoPage(props: NvoPageProps) {
  return (
    <main className="overflow-hidden">
      <NvoHero
        grade={props.grade}
        text={props.heroText}
        cta={props.heroCta}
        image={props.heroImage}
        imageAlt={props.heroImageAlt}
      />

      <CourseSwitcher slug={props.slug} />

      {props.sections.map((section, i) => renderSection(section, i))}

      <div className="flex justify-center px-5 pb-12 sm:px-8">
        <Link
          href="/kursove"
          className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-paper px-6 py-3 font-extrabold text-brand-dark transition hover:border-brand/45"
        >
          Всички курсове
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>

      <NvoFinalCta {...props.finalCta} />
    </main>
  )
}
