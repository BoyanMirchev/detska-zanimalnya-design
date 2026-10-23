import type { ReactNode } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { EtSubNav } from "./et-subnav"

export function EtShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <AdminShell title={title} subtitle={subtitle} actions={actions}>
      <EtSubNav />
      {children}
    </AdminShell>
  )
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-[#17324D]/10 bg-white px-6 py-12 text-center">
      <p className="text-lg font-extrabold text-[#17324D]">{title}</p>
      {children && <div className="max-w-md font-bold leading-relaxed text-[#17324D]/55">{children}</div>}
    </div>
  )
}

const TONES = {
  green: "bg-[#9ED9CA]/35 text-[#1F6B5C]",
  orange: "bg-[#DD5B26]/12 text-[#B5461A]",
  gray: "bg-[#17324D]/8 text-[#17324D]/70",
  red: "bg-[#F27B6B]/15 text-[#C7503F]",
  blue: "bg-[#17324D] text-white",
} as const

export function Pill({ tone = "gray", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold ${TONES[tone]}`}>
      {children}
    </span>
  )
}

export function Pagination({ page, total, pageSize, hrefFor }: { page: number; total: number; pageSize: number; hrefFor: (p: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <nav aria-label="Страници" className="flex items-center justify-between gap-3 text-sm font-extrabold text-[#17324D]">
      <span className="text-[#17324D]/55">
        Страница {page} от {pages} · {total} записа
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <a href={hrefFor(page - 1)} className="rounded-full bg-white px-4 py-2 shadow-sm hover:bg-[#17324D]/5">
            Назад
          </a>
        )}
        {page < pages && (
          <a href={hrefFor(page + 1)} className="rounded-full bg-white px-4 py-2 shadow-sm hover:bg-[#17324D]/5">
            Напред
          </a>
        )}
      </div>
    </nav>
  )
}

export const formatDateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("bg-BG", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Sofia" }).format(new Date(value))
    : "—"

export const formatPercent = (value: number | null) => (value === null ? "—" : `${value.toLocaleString("bg-BG", { maximumFractionDigits: 1 })}%`)
