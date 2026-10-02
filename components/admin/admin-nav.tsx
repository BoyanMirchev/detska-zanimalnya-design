"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Inbox, Users } from "lucide-react"

const LINKS = [
  { href: "/admin", label: "Запитвания", icon: Inbox, match: (p: string) => p === "/admin" },
  { href: "/admin/students", label: "Ученици и плащания", icon: Users, match: (p: string) => p.startsWith("/admin/students") },
  { href: "/admin/payments", label: "Отчети", icon: BarChart3, match: (p: string) => p.startsWith("/admin/payments") },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Админ навигация" className="-mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-2 px-1">
        {LINKS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
                  active ? "bg-[#17324D] text-white" : "bg-white text-[#17324D] shadow-sm hover:-translate-y-0.5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
