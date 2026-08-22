"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, Phone, X } from "lucide-react"
import { PhoneLink } from "@/components/phone-link"
import { contact, navItems } from "@/lib/nav"

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/"
  if (href.startsWith("/zanimalnya")) return pathname.startsWith("/zanimalnya")
  return pathname.startsWith(href.split("#")[0])
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [desktopSub, setDesktopSub] = useState<string | null>(null)
  const [mobileSub, setMobileSub] = useState<string | null>("Занималня")

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[24px] border border-brand/15 bg-cream/90 px-4 py-3 shadow-[0_12px_40px_rgba(59,36,22,0.1)] backdrop-blur-xl sm:px-6">
        {/* Left: navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Основна навигация">
          {navItems.map((item) => {
            const active = isActive(item.href, pathname)
            if (item.children) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setDesktopSub(item.label)}
                  onMouseLeave={() => setDesktopSub(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                      active ? "bg-brand/12 text-brand-dark" : "text-ink/75 hover:text-brand-dark"
                    }`}
                    aria-expanded={desktopSub === item.label}
                  >
                    {item.label}
                    <ChevronDown className={`h-4 w-4 transition ${desktopSub === item.label ? "rotate-180" : ""}`} />
                  </Link>
                  {desktopSub === item.label && (
                    <div className="absolute left-0 top-full w-80 pt-3">
                      <div className="overflow-hidden rounded-[22px] border border-brand/12 bg-paper p-2 shadow-[0_20px_50px_rgba(59,36,22,0.16)]">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition hover:bg-cream"
                          >
                            <span className="text-sm font-extrabold text-ink">{child.short}</span>
                            <span className="shrink-0 rounded-full bg-brand/12 px-2.5 py-1 text-[11px] font-black text-brand-dark">
                              {child.age}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                  active ? "bg-brand/12 text-brand-dark" : "text-ink/75 hover:text-brand-dark"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <PhoneLink
            href={contact.phonePrimaryHref}
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            <Phone className="h-4 w-4" />
            {contact.phonePrimary}
          </PhoneLink>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white lg:hidden"
          aria-label={open ? "Затвори менюто" : "Отвори менюто"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Right: logo */}
        <Link href="/" className="group flex items-center gap-3" aria-label="Хралупата – начало">
          <span className="text-right">
            <span className="brand-font block text-[1.35rem] font-extrabold leading-none tracking-tight text-brand-dark">
              Хралупата
            </span>
            <span className="mt-2 block text-[10px] font-black uppercase leading-none tracking-[0.16em] text-ink/55">
              ученическа занималня
            </span>
          </span>
          <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-brand/20 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <Image src="/images/logo-round.png" alt="Логото на Хралупата – бухалче в дървесна къщичка" width={56} height={56} className="h-full w-full object-cover" />
          </span>
        </Link>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="mx-auto mt-2 max-w-7xl rounded-[24px] border border-brand/12 bg-paper p-4 shadow-2xl lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => setMobileSub((v) => (v === item.label ? null : item.label))}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-extrabold text-ink hover:bg-cream"
                      aria-expanded={mobileSub === item.label}
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition ${mobileSub === item.label ? "rotate-180" : ""}`} />
                    </button>
                    {mobileSub === item.label && (
                      <div className="mb-1 ml-2 grid gap-1 border-l-2 border-brand/15 pl-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-4 py-2.5 text-sm font-bold text-ink/80 hover:bg-cream"
                          >
                            {child.short}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 font-extrabold text-ink hover:bg-cream"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
            <PhoneLink
              href={contact.phonePrimaryHref}
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 font-extrabold text-white"
            >
              <Phone className="h-4 w-4" />
              {contact.phonePrimary}
            </PhoneLink>
        </div>
      )}
    </header>
  )
}
