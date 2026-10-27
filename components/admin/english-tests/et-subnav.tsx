"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const BASE = "/admin/english-tests"

const LINKS = [
  { href: BASE, label: "Преглед", match: (p: string) => p === BASE },
  { href: `${BASE}/levels`, label: "Нива", match: (p: string) => p.startsWith(`${BASE}/levels`) },
  { href: `${BASE}/questions`, label: "Банка с въпроси", match: (p: string) => p.startsWith(`${BASE}/questions`) },
  { href: `${BASE}/create`, label: "Създаване на тест", match: (p: string) => p === `${BASE}/create` },
  { href: `${BASE}/tests`, label: "Всички тестове", match: (p: string) => p.startsWith(`${BASE}/tests`) || p.endsWith("/edit") },
  { href: `${BASE}/results`, label: "Резултати", match: (p: string) => p.startsWith(`${BASE}/results`) },
  { href: `${BASE}/students`, label: "Ученици", match: (p: string) => p.startsWith(`${BASE}/students`) },
  { href: `${BASE}/settings`, label: "Настройки", match: (p: string) => p.startsWith(`${BASE}/settings`) },
]

export function EtSubNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Тестове по английски" className="-mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 rounded-full bg-white p-1 shadow-sm">
        {LINKS.map(({ href, label, match }) => {
          const active = match(pathname)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  active ? "bg-[#DD5B26] text-white" : "text-[#17324D]/70 hover:bg-[#17324D]/5 hover:text-[#17324D]"
                }`}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
