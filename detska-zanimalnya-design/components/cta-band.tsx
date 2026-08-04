import { MessageCircleMore, Phone } from "lucide-react"
import { ContactDialog } from "@/components/contact-dialog"
import { site } from "@/lib/site"

export function CtaBand({
  title = "Заповядайте на безплатно опознавателно посещение.",
  text = "Разгледайте пространството, запознайте се с екипа и задайте всички важни въпроси преди да вземете решение.",
}: {
  title?: string
  text?: string
}) {
  return (
    <section className="px-5 pb-24 pt-4 sm:px-8 lg:pb-32">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[44px] bg-primary px-6 py-14 text-primary-foreground sm:px-12 lg:px-16 lg:py-20">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-white/15" />
        <div className="absolute -bottom-28 left-[30%] h-64 w-64 rotate-12 rounded-[60px] bg-white/10" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-black">
              <MessageCircleMore className="h-4 w-4" />
              Нека се запознаем
            </span>
            <h2 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
              {title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-primary-foreground/85">{text}</p>
          </div>
          <div className="flex flex-col gap-3">
            {site.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-bark px-7 py-4 font-extrabold text-cream transition hover:-translate-y-1"
              >
                <Phone className="h-5 w-5" />
                {phone}
              </a>
            ))}
            <ContactDialog />
          </div>
        </div>
      </div>
    </section>
  )
}
