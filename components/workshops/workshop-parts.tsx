import Image from "next/image"
import Link from "next/link"
import {
  CalendarDays,
  Candy,
  ChevronRight,
  Clock,
  Cookie,
  Gift,
  Home,
  Hourglass,
  Mail,
  Palette,
  PartyPopper,
  PenLine,
  Ribbon,
  Shapes,
  Smile,
  Sparkles,
  Sticker,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  AVAILABILITY_MESSAGES,
  formatAgeRange,
  formatDuration,
  formatFreePlaces,
  formatStartTime,
  formatWorkshopDate,
  getAvailability,
  isProxiedImage,
  PENDING_DETAILS,
  type Workshop,
} from "@/lib/workshops/types"
import type { ReactNode } from "react"
import { InlinePrice } from "@/components/pricing/price-display"
import type { PriceRecord } from "@/lib/pricing/types"

const ICONS: Record<string, LucideIcon> = {
  candy: Candy,
  cookie: Cookie,
  gift: Gift,
  home: Home,
  mail: Mail,
  palette: Palette,
  party: PartyPopper,
  pen: PenLine,
  ribbon: Ribbon,
  shapes: Shapes,
  sparkles: Sparkles,
  sticker: Sticker,
}

export function activityIcon(name?: string): LucideIcon {
  return (name && ICONS[name]) || Sparkles
}

export function WorkshopImage({
  src,
  alt,
  sizes,
  priority,
  className = "object-cover",
}: {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
}) {
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // Admin-uploaded images are streamed from our own Blob proxy route.
      unoptimized={isProxiedImage(src)}
      className={className}
    />
  )
}

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Навигационна пътечка" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm font-bold text-ink/60">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4 text-ink/35" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="rounded transition hover:text-brand-dark">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function AvailabilityBadge({ workshop }: { workshop: Workshop }) {
  const availability = getAvailability(workshop)
  const tone =
    availability.state === "open"
      ? "bg-leaf/15 text-[#4c6a1f]"
      : availability.state === "full"
        ? "bg-berry/15 text-berry"
        : "bg-ink/10 text-ink/75"
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold ${tone}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {AVAILABILITY_MESSAGES[availability.state]}
    </span>
  )
}

export function WorkshopInfoGrid({ workshop, price }: { workshop: Workshop; price: PriceRecord | null }) {
  const items: { icon: LucideIcon; label: string; value: ReactNode }[] = [
    { icon: CalendarDays, label: "Дата", value: formatWorkshopDate(workshop.event_date) },
    { icon: Clock, label: "Начален час", value: formatStartTime(workshop.start_time) },
    { icon: Hourglass, label: "Продължителност", value: formatDuration(workshop.duration_minutes) },
    { icon: Smile, label: "Възраст", value: formatAgeRange(workshop.age_min, workshop.age_max) },
    { icon: Ticket, label: "Цена", value: price ? <InlinePrice price={price} /> : PENDING_DETAILS },
    { icon: Users, label: "Свободни места", value: formatFreePlaces(workshop) },
  ]
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-4 rounded-[28px] bg-paper p-5 shadow-sm">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-dark">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <dt className="text-sm font-black uppercase tracking-[0.14em] text-ink/50">{label}</dt>
            <dd className="mt-1 text-lg font-extrabold leading-snug text-ink first-letter:uppercase">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

export function WorkshopCard({ workshop, headingLevel = "h3" }: { workshop: Workshop; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[36px] bg-paper shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
        <WorkshopImage
          src={workshop.image_url}
          alt={workshop.image_alt}
          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 400px"
          className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-7">
        <AvailabilityBadge workshop={workshop} />
        <Heading className="text-2xl font-extrabold leading-tight text-ink text-balance">{workshop.title}</Heading>
        <p className="flex-1 font-semibold leading-7 text-ink/65 text-pretty">{workshop.short_description}</p>
        <Link
          href={`/rabotilnici/${workshop.slug}`}
          aria-label={`Научи повече за „${workshop.title}“`}
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-brand px-6 py-3 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          Научи повече
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

/** Small, quiet festive accent reused on both hero sections. */
export function FestiveGarland() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-24 flex justify-center gap-6 opacity-70 lg:top-28">
      {["bg-berry", "bg-sun", "bg-leaf", "bg-sky", "bg-berry", "bg-sun", "bg-leaf"].map((c, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${c} animate-bob motion-reduce:animate-none`}
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
    </div>
  )
}
