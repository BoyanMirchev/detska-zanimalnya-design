import Link from "next/link"
import type { ReactNode } from "react"

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-et-mist px-4 py-12 font-sans">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Link href="/testove" className="self-center font-display text-lg font-extrabold text-et-navy">
          Тестове по английски
        </Link>
        <div className="flex flex-col gap-6 rounded-3xl border border-et-navy/10 bg-paper p-6 shadow-sm sm:p-8">
          <header className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-extrabold text-balance text-et-navy">{title}</h1>
            {subtitle ? <p className="leading-relaxed text-pretty text-et-navy/70">{subtitle}</p> : null}
          </header>
          {children}
        </div>
      </div>
    </main>
  )
}
