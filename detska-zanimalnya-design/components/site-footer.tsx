import Image from "next/image"
import Link from "next/link"
import { Clock3, MapPin, Phone } from "lucide-react"
import { navLinks, site, zanimalnyaLinks } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="border-t border-cream-deep bg-cream px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3" aria-label={`${site.fullName} — начало`}>
            <span className="relative h-14 w-14 overflow-hidden rounded-2xl bg-primary/10 ring-2 ring-primary/15">
              <Image src={site.logo || "/placeholder.svg"} alt={`Лого на ${site.name}`} fill className="object-contain p-1" />
            </span>
            <span className="leading-none">
              <span className="font-display block text-2xl font-extrabold text-primary-dark">{site.name}</span>
              <span className="block text-xs font-extrabold uppercase tracking-[0.16em] text-leaf-dark">
                Ученическа занималня
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm font-semibold leading-7 text-bark/65">
            Топло място за учене, игра и приятелства — за деца от 2 до 7 клас, целогодишно.
          </p>
        </div>

        <div>
          <p className="font-display text-lg font-extrabold text-bark">Занималня</p>
          <ul className="mt-4 grid gap-2.5">
            {zanimalnyaLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-bold text-bark/65 transition hover:text-primary-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-lg font-extrabold text-bark">Контакти</p>
          <ul className="mt-4 grid gap-3">
            {site.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 font-bold text-bark/70 transition hover:text-primary-dark"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {phone}
                </a>
              </li>
            ))}
            <li className="inline-flex items-center gap-2 font-bold text-bark/70">
              <Clock3 className="h-4 w-4 text-primary" />
              {site.hours}
            </li>
            <li className="inline-flex items-start gap-2 font-bold text-bark/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {site.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-cream-deep pt-6 text-sm font-bold text-bark/50 sm:flex-row">
        <p>© {new Date().getFullYear()} Ученическа занималня Хралупата</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-primary-dark">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
