import Image from "next/image"
import Link from "next/link"
import { Clock3, Phone } from "lucide-react"
import { Facebook, Instagram } from "@/components/social-icons"
import { contact, navItems, zanimalnyaChildren } from "@/lib/nav"

export function SiteFooter() {
  return (
    <footer className="border-t border-brand/12 bg-paper px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-8">
        <div>
          <Link href="/" className="flex items-center gap-3" aria-label="Хралупата – начало">
            <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full ring-2 ring-brand/20">
              <Image src="/images/logo-round.png" alt="Логото на Хралупата" width={56} height={56} className="h-full w-full object-cover" />
            </span>
            <span>
              <span className="brand-font block text-xl font-extrabold leading-none text-brand-dark">Хралупата</span>
              <span className="mt-2 block text-[10px] font-black uppercase leading-none tracking-[0.16em] text-ink/55">
                ученическа занималня
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm font-semibold leading-7 text-ink/60">
            Целодневна ученическа занималня с топла грижа, индивидуален подход и много усмивки – от 1. до 7. клас,
            предучилищна група и лятна занималня.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook страница на Хралупата"
              className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand-dark transition hover:-translate-y-1 hover:bg-brand hover:text-white"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram профил на Хралупата"
              className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand-dark transition hover:-translate-y-1 hover:bg-brand hover:text-white"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-dark">Занималня</p>
          <ul className="mt-4 grid gap-2.5">
            {zanimalnyaChildren.map((child) => (
              <li key={child.href}>
                <Link href={child.href} className="font-bold text-ink/70 transition hover:text-brand-dark">
                  {child.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-dark">Меню и контакти</p>
          <ul className="mt-4 grid gap-2.5">
            {navItems
              .filter((i) => !i.children)
              .map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-bold text-ink/70 transition hover:text-brand-dark">
                    {item.label}
                  </Link>
                </li>
              ))}
          </ul>
          <div className="mt-5 grid gap-2">
            <a href={contact.phonePrimaryHref} className="flex items-center gap-2 font-extrabold text-ink">
              <Phone className="h-4 w-4 text-brand" />
              {contact.phonePrimary}
            </a>
            <a href={contact.phoneSecondaryHref} className="flex items-center gap-2 font-extrabold text-ink">
              <Phone className="h-4 w-4 text-brand" />
              {contact.phoneSecondary}
            </a>
            <span className="flex items-center gap-2 font-bold text-ink/60">
              <Clock3 className="h-4 w-4 text-leaf" />
              {contact.hours}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-brand/10 pt-6 text-sm font-bold text-ink/45">
        © {new Date().getFullYear()} Ученическа занималня Хралупата. Всички права запазени.
      </div>
    </footer>
  )
}
