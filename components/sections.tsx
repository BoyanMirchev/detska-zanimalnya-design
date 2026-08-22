import Image from "next/image"
import { ArrowRight, MessageCircleMore, Phone, Sparkles } from "lucide-react"
import { ContactDialog } from "@/components/contact-dialog"
import { PhoneLink } from "@/components/phone-link"
import { contact } from "@/lib/nav"

export function PageHero({
  badge,
  title,
  highlight,
  text,
  image,
  imageAlt,
}: {
  badge: string
  title: string
  highlight?: string
  text: string
  image: string
  imageAlt: string
}) {
  return (
    <section className="noise relative px-5 pb-16 pt-32 sm:px-8 lg:pt-40">
      <div className="animate-float absolute -left-28 top-40 h-72 w-72 rounded-full bg-sun/20 blur-3xl" />
      <div className="animate-float-slow absolute -right-24 top-16 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="animate-pop mb-6 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-paper/80 px-4 py-2 text-sm font-extrabold text-brand-dark shadow-sm">
            <Sparkles className="h-4 w-4 text-sun" />
            {badge}
          </div>
          <h1 className="max-w-2xl text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.02em] text-ink sm:text-6xl">
            {title}{" "}
            {highlight && (
              <span className="relative inline-block text-brand">
                {highlight}
                <svg className="absolute -bottom-6 left-0 w-full" viewBox="0 0 330 22" fill="none" aria-hidden="true">
                  <path d="M4 14C78 2 221 2 326 13" stroke="#F4B63F" strokeWidth="9" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-ink/65">{text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PhoneLink
              href={contact.phonePrimaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-brand-dark"
            >
              <Phone className="h-5 w-5" />
              Обади се: {contact.phonePrimary}
            </PhoneLink>
            <ContactDialog />
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="animate-bob absolute -right-4 -top-4 z-10 grid h-16 w-16 place-items-center rounded-full bg-sun text-ink shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="animate-float absolute -bottom-5 -left-5 z-10 h-14 w-14 rounded-2xl bg-leaf/90 shadow-lg" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border-[10px] border-white bg-brand-soft soft-shadow">
            <Image src={image || "/placeholder.svg"} alt={imageAlt} fill sizes="(max-width: 1024px) 90vw, 520px" className="object-cover" priority />
          </div>
        </div>
      </div>
    </section>
  )
}

export function BottomCTA() {
  return (
    <section className="px-5 pb-24 pt-8 sm:px-8 lg:pb-32">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[44px] bg-brand px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
        <div className="animate-spin-slow absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-white/15" />
        <div className="animate-float absolute -bottom-24 left-[35%] h-56 w-56 rotate-12 rounded-[60px] bg-sun/30" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-black text-brand-dark">
              <MessageCircleMore className="h-4 w-4" />
              Нека се запознаем
            </span>
            <h2 className="mt-6 max-w-3xl text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl">
              Заповядайте на безплатно опознавателно посещение.
            </h2>
            <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white/85">
              Разгледайте пространството, запознайте се с екипа и задайте всички важни въпроси преди да вземете решение.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <PhoneLink
              href={contact.phonePrimaryHref}
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-extrabold text-white transition hover:-translate-y-1"
            >
              <Phone className="h-5 w-5" />
              {contact.phonePrimary}
            </PhoneLink>
            <a
              href={contact.phoneSecondaryHref}
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-brand-dark transition hover:-translate-y-1"
            >
              <Phone className="h-5 w-5" />
              {contact.phoneSecondary}
            </a>
            <ContactDialog />
          </div>
        </div>
      </div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string
  title: string
  align?: "left" | "center"
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : ""}>
      <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-brand-dark">{eyebrow}</p>
      <h2 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl text-balance">
        {title}
      </h2>
    </div>
  )
}
