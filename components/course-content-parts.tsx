import Link from "next/link"
import { ArrowRight, Check, Phone } from "lucide-react"
import { ContactDialog } from "@/components/contact-dialog"
import { PhoneLink } from "@/components/phone-link"
import { contact } from "@/lib/nav"

export function CheckList({ items, columns = false }: { items: string[]; columns?: boolean }) {
  return (
    <ul className={`grid gap-3 ${columns ? "sm:grid-cols-2" : ""}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-2xl border border-brand/10 bg-paper p-4">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="font-bold leading-6 text-ink/80">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4">
      {items.map((p) => (
        <p key={p} className="text-lg font-semibold leading-8 text-ink/65">
          {p}
        </p>
      ))}
    </div>
  )
}

export function EnrollCTA({ title, text }: { title: string; text: string }) {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:pb-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[36px] bg-brand p-8 text-center text-white sm:p-12">
        <h2 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
        <p className="max-w-xl text-lg font-semibold leading-8 text-white/85">{text}</p>
        <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
          <Link
            href="#zapisvane"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-brand-dark transition hover:-translate-y-1"
          >
            Запиши детето
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <PhoneLink
            href={contact.phonePrimaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-4 font-extrabold text-white transition hover:-translate-y-1"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            {contact.phonePrimary}
          </PhoneLink>
          <ContactDialog />
        </div>
      </div>
    </section>
  )
}
