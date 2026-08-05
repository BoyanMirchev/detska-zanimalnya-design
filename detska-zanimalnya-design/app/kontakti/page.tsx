import type { Metadata } from "next"
import { Phone, Clock3, MessageCircleMore, CalendarCheck } from "lucide-react"
import { PageHero, SectionHeading } from "@/components/sections"
import { ContactDialog } from "@/components/contact-dialog"
import { Reveal } from "@/components/reveal"
import { contact } from "@/lib/nav"

export const metadata: Metadata = {
  title: "Контакти | Хралупата",
  description:
    "Свържете се с ученическа занималня Хралупата - телефони за връзка, работно време и форма за запитване. Заповядайте на безплатно опознавателно посещение.",
}

const phones = [
  { label: "Основен телефон", value: contact.phonePrimary, href: contact.phonePrimaryHref },
  { label: "Втори телефон", value: contact.phoneSecondary, href: contact.phoneSecondaryHref },
]

export default function KontaktiPage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="Контакти"
        title="Свържете се с"
        highlight="нас"
        text="Имате въпрос или искате да запишете детето си? Обадете ни се или ни пишете - ще се радваме да се запознаем и да отговорим на всичко, което ви вълнува."
        image="/images/photo-toddlers-banner.png"
        imageAlt="Деца рисуват пред банера на Хралупата"
      />

      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="За връзка" title="Как да ни намерите." />

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* Phones */}
            <Reveal as="div" className="grid gap-6">
              <div className="rounded-[32px] border border-brand/12 bg-paper p-7 sm:p-9">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand text-white">
                    <Phone className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-extrabold text-ink">Телефони</h3>
                    <p className="font-semibold text-ink/60">Обадете ни се по всяко време през работния ден</p>
                  </div>
                </div>
                <div className="mt-7 grid gap-3">
                  {phones.map((phone) => (
                    <a
                      key={phone.href}
                      href={phone.href}
                      className="group flex items-center justify-between gap-4 rounded-[20px] border border-brand/12 bg-cream px-5 py-4 transition hover:-translate-y-0.5 hover:border-brand/30"
                    >
                      <div>
                        <p className="text-sm font-bold text-ink/55">{phone.label}</p>
                        <p className="text-xl font-black text-ink">{phone.value}</p>
                      </div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white transition group-hover:scale-110">
                        <Phone className="h-5 w-5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] bg-leaf/15 p-7 sm:p-9">
                <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-leaf/25 text-leaf-dark">
                  <Clock3 className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-ink">Работно време</h3>
                <p className="mt-2 text-3xl font-black text-brand-dark">{contact.hours}</p>
                <p className="mt-2 font-semibold leading-7 text-ink/65">Понеделник – Петък</p>
              </div>
            </Reveal>

            {/* Write us */}
            <Reveal as="div" delay={120} className="flex flex-col rounded-[32px] bg-brand p-7 text-white sm:p-9">
              <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-white/15">
                <MessageCircleMore className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-2xl font-extrabold">Пишете ни съобщение</h3>
              <p className="mt-2 max-w-md font-semibold leading-7 text-white/80">
                Оставете ни запитване през формата и ще се свържем с вас възможно най-скоро. Разкажете ни за детето и
                какво търсите – ние ще ви насочим.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ContactDialog />
                <a
                  href={contact.phonePrimaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-brand-dark transition hover:-translate-y-1"
                >
                  <Phone className="h-5 w-5" />
                  {contact.phonePrimary}
                </a>
              </div>

              <div className="mt-auto flex items-start gap-3 rounded-[20px] bg-white/10 px-5 py-4 pt-8 sm:mt-10">
                <CalendarCheck className="mt-0.5 h-6 w-6 shrink-0 text-sun" />
                <p className="font-semibold leading-7 text-white/85">
                  Заповядайте на <span className="font-black text-white">безплатно опознавателно посещение</span> –
                  разгледайте пространството и се запознайте с екипа ни.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
