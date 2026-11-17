import Link from "next/link"
import { Check, Gift, Info, PenLine, Sparkles } from "lucide-react"
import { Reveal } from "@/components/reveal"
import { BottomCTA, SectionHeading } from "@/components/sections"
import { getAvailability, AVAILABILITY_MESSAGES, toParagraphs, type Workshop } from "@/lib/workshops/types"
import {
  activityIcon,
  AvailabilityBadge,
  Breadcrumbs,
  FestiveGarland,
  WorkshopCard,
  WorkshopImage,
  WorkshopInfoGrid,
} from "@/components/workshops/workshop-parts"
import { WorkshopRegistrationForm, type WorkshopOption } from "@/components/workshops/workshop-registration-form"

export function WorkshopDetail({ workshop, all }: { workshop: Workshop; all: Workshop[] }) {
  const availability = getAvailability(workshop)
  const related = all.filter((w) => w.id !== workshop.id).slice(0, 3)
  const options: WorkshopOption[] = all.map((w) => ({
    slug: w.slug,
    title: w.title,
    requiresAllergyInfo: w.requires_allergy_info,
    open: getAvailability(w).state === "open",
  }))

  return (
    <>
      <section className="noise relative px-5 pb-16 pt-32 sm:px-8 lg:pt-40">
        <FestiveGarland />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Breadcrumbs
              items={[{ label: "Начало", href: "/" }, { label: "Работилници", href: "/rabotilnici" }, { label: workshop.title }]}
            />
            <AvailabilityBadge workshop={workshop} />
            <h1 className="mt-6 max-w-2xl text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.02em] text-ink text-balance sm:text-6xl">
              {workshop.hero_title}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-ink/65 text-pretty">{workshop.hero_subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#zapisvane"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 hover:bg-brand-dark motion-reduce:hover:translate-y-0"
              >
                <PenLine className="h-5 w-5" aria-hidden="true" />
                Запиши детето
              </a>
              <a
                href="#informaciya"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-paper px-7 py-4 font-extrabold text-brand-dark shadow-sm transition hover:-translate-y-1 motion-reduce:hover:translate-y-0"
              >
                <Info className="h-5 w-5" aria-hidden="true" />
                Дата и подробности
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="animate-bob absolute -right-4 -top-4 z-10 grid h-16 w-16 place-items-center rounded-full bg-sun text-ink shadow-lg motion-reduce:animate-none">
              <Sparkles className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border-[10px] border-white bg-brand-soft soft-shadow">
              <WorkshopImage src={workshop.image_url} alt={workshop.image_alt} sizes="(max-width: 1024px) 90vw, 520px" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionHeading eyebrow="За работилницата" title={workshop.title} />
          </Reveal>
          <Reveal delay={100} className="flex flex-col gap-5 text-lg font-semibold leading-8 text-ink/70">
            {toParagraphs(workshop.about).map((p, i) => (
              <p key={i} className="text-pretty">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {workshop.activities.length > 0 && (
        <section className="bg-paper/60 px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading eyebrow="Стъпка по стъпка" title="Какво ще правим?" align="center" />
            </Reveal>
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {workshop.activities.map((a, i) => {
                const Icon = activityIcon(a.icon)
                return (
                  <Reveal as="li" key={a.title} delay={i * 70} className="relative flex flex-col gap-4 rounded-[32px] bg-paper p-7 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-black text-ink/35" aria-hidden="true">
                        {`Стъпка ${i + 1}`}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-ink">{a.title}</h3>
                    <p className="font-semibold leading-7 text-ink/65 text-pretty">{a.text}</p>
                  </Reveal>
                )
              })}
            </ol>
          </div>
        </section>
      )}

      {(workshop.materials.length > 0 || workshop.take_home.length > 0) && (
        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            {workshop.materials.length > 0 && (
              <Reveal className="rounded-[36px] bg-paper p-8 shadow-sm sm:p-10">
                <h2 className="text-3xl font-extrabold text-ink">{workshop.materials_title}</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {workshop.materials.map((m) => (
                    <li key={m} className="flex items-start gap-3 font-bold text-ink/75">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf" aria-hidden="true" />
                      {m}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {workshop.take_home.length > 0 && (
              <Reveal delay={100} className="rounded-[36px] bg-brand-soft p-8 sm:p-10">
                <h2 className="text-3xl font-extrabold text-ink">Какво ще отнесат децата вкъщи?</h2>
                <ul className="mt-6 flex flex-col gap-3">
                  {workshop.take_home.map((t) => (
                    <li key={t} className="flex items-start gap-3 font-bold text-ink/80">
                      <Gift className="mt-0.5 h-5 w-5 shrink-0 text-brand-dark" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
          {workshop.notices.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-4">
              {workshop.notices.map((n) => (
                <aside key={n.title} className="flex items-start gap-4 rounded-[28px] border-2 border-sun/50 bg-sun/10 p-6">
                  <Info className="mt-1 h-6 w-6 shrink-0 text-brand-dark" aria-hidden="true" />
                  <div>
                    <h2 className="text-lg font-extrabold text-ink">{n.title}</h2>
                    <p className="mt-1 font-semibold leading-7 text-ink/70 text-pretty">{n.text}</p>
                  </div>
                </aside>
              ))}
            </div>
          )}
        </section>
      )}

      <section id="informaciya" className="scroll-mt-28 bg-paper/60 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading eyebrow="Информация" title="Кога и как?" />
          </Reveal>
          <div className="mt-10">
            <WorkshopInfoGrid workshop={workshop} />
          </div>
        </div>
      </section>

      <section id="zapisvane" className="scroll-mt-28 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="Записване" title="Запазете място за вашето дете" />
            <p className="mt-6 text-lg font-semibold leading-8 text-ink/65 text-pretty">
              Попълнете формата и ще се свържем с вас, за да потвърдим участието. Мястото се счита за запазено след
              потвърждение от нашия екип.
            </p>
          </div>
          {availability.state === "open" ? (
            <WorkshopRegistrationForm options={options} defaultSlug={workshop.slug} />
          ) : (
            <div role="status" className="flex flex-col items-start gap-4 rounded-[36px] bg-paper p-8 shadow-sm sm:p-10">
              <AvailabilityBadge workshop={workshop} />
              <p className="text-lg font-semibold leading-8 text-ink/70 text-pretty">
                {`${AVAILABILITY_MESSAGES[availability.state]}. Обадете се ни или ни пишете — ще ви информираме, когато има свободни места или нова дата.`}
              </p>
              <Link href="/kontakti" className="rounded-full bg-brand px-6 py-3 font-extrabold text-white transition hover:bg-brand-dark">
                Свържете се с нас
              </Link>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Още работилници" title="Разгледайте и другите работилници" />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((w) => (
                <WorkshopCard key={w.id} workshop={w} />
              ))}
            </div>
          </div>
        </section>
      )}

      <BottomCTA />
    </>
  )
}
