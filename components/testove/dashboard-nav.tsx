"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenCheck, History, Home, LogOut, Trophy, UserRound } from "lucide-react"
import { logoutStudent } from "@/app/actions/english-tests/student"

const LINKS = [
  { href: "/testove/dashboard", label: "Начало", icon: Home },
  { href: "/testove/dashboard/testove", label: "Налични тестове", icon: BookOpenCheck },
  { href: "/testove/dashboard/rezultati", label: "Моите резултати", icon: Trophy },
  { href: "/testove/dashboard/istoria", label: "История на тестовете", icon: History },
  { href: "/testove/dashboard/profil", label: "Моят профил", icon: UserRound },
]

export function DashboardNav({ name }: { name: string }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Ученически панел" className="flex flex-col gap-4 lg:sticky lg:top-6">
      <div className="hidden flex-col gap-1 px-3 lg:flex">
        <span className="font-display text-lg font-extrabold text-et-navy">Тестове по английски</span>
        <span className="text-sm font-bold text-et-navy/60">{name}</span>
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                  active ? "bg-et-navy text-paper" : "text-et-navy hover:bg-et-navy/5"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
        <li className="shrink-0">
          <form action={logoutStudent}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-berry transition hover:bg-et-coral/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Изход
            </button>
          </form>
        </li>
      </ul>
    </nav>
  )
}
