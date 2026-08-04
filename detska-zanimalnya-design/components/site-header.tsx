"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, Phone, X } from "lucide-react"
import { navLinks, site } from "@/lib/site"

function isActive(pathname: string, href: string, hasChildren?: boolean) {
  if (href === "/") return pathname === "/"
  if (hasChildren) return pathname.startsWith("/zanimalnya")
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState(true)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[26px] border border-cream-deep bg-cream/95 px-4 py-3 shadow-[0_14px_44px_rgba(58,36,22,0.12)] backdrop-blur-xl sm:px-6">
        {/* Left: navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Основна навигация">
          {navLinks.map((item) => {
            const active = isActive(pathname, item.href, Boolean(item.children))
            if (item.children) {
              return (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                      active ? "bg-primary text-primary-foreground" : "text-bark/75 hover:bg-cream-deep hover:text-bark"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="w-72 rounded-3xl border border-cream-deep bg-card p-2 shadow-[0_20px_50px_rgba(58,36,22,0.18)]">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-2xl px-4 py-3 text-sm font-bold transition ${
                            pathname === child.href
                              ? "bg-cream-deep text-primary-dark"
                              : "text-bark/80 hover:bg-cream-deep hover:text-primary-dark"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                  active ? "bg-primary text-primary-foreground" : "text-bark/75 hover:bg-cream-deep hover:text-bark"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <a
            href={`tel:${site.phones[0].replace(/\s/g, "")}`}
            className="ml-2 inline-flex items-center gap-2 rounded-full border-2 border-primary/20 px-4 py-2 text-sm font-extrabold text-primary-dark transition hover:bg-primary hover:text-primary-foreground"
          >
            <Phone className="h-4 w-4" />
            {site.phones[0]}
          </a>
        </nav>

        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground lg:hidden"
          aria-label={mobileOpen ? "Затвори менюто" : "Отвори менюто"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Right: logo */}
        <Link href="/" className="group flex items-center gap-3" aria-label={`${site.fullName} — начало`}>
          <span className="leading-none text-right">
            <span className="font-display block text-xl font-extrabold tracking-tight text-primary-dark sm:text-2xl">
              {site.name}
            </span>
            <span className="block text-[0.6rem] font-extrabold uppercase tracking-[0.16em] text-leaf-dark sm:text-xs">
              Ученическа занималня
            </span>
          </span>
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-primary/10 ring-2 ring-primary/15 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-14 sm:w-14">
            <Image src={site.logo || "/placeholder.svg"} alt={`Лого на ${site.name}`} fill className="object-contain p-1" priority />
          </span>
        </Link>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-[26px] border border-cream-deep bg-card p-4 shadow-2xl lg:hidden">
          <nav className="grid gap-1" aria-label="Мобилна навигация">
            {navLinks.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="rounded-2xl bg-cream/60">
                    <button
                      type="button"
                      onClick={() => setMobileSubOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 font-extrabold text-bark"
                      aria-expanded={mobileSubOpen}
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition ${mobileSubOpen ? "rotate-180" : ""}`} />
                    </button>
                    {mobileSubOpen && (
                      <div className="grid gap-1 px-2 pb-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-xl px-4 py-2.5 text-sm font-bold text-bark/80 hover:bg-cream-deep"
                          >
                            {child.label}
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
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 font-extrabold text-bark hover:bg-cream-deep"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <a
            href={`tel:${site.phones[0].replace(/\s/g, "")}`}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-extrabold text-primary-foreground"
          >
            <Phone className="h-4 w-4" />
            {site.phones[0]}
          </a>
        </div>
      )}
    </header>
  )
}
