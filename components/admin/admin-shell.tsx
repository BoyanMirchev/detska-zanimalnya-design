import type { ReactNode } from "react"
import { LogOut, Sparkles } from "lucide-react"
import { logout } from "@/app/actions/admin"
import { AdminNav } from "@/components/admin/admin-nav"

export function AdminShell({
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
    <main className="min-h-screen bg-[#F2F7FB] px-5 pb-10 pt-32 sm:px-8 lg:pt-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#9ED9CA]/30 px-4 py-1.5 text-sm font-extrabold text-[#1F6B5C]">
                <Sparkles className="h-4 w-4" />
                Малки откриватели
              </span>
              <h1 className="mt-3 text-balance text-3xl font-extrabold text-[#17324D] sm:text-4xl">{title}</h1>
              {subtitle && <p className="mt-1 font-bold text-[#17324D]/55">{subtitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm transition hover:-translate-y-0.5"
                >
                  <LogOut className="h-5 w-5" />
                  Изход
                </button>
              </form>
            </div>
          </div>
          <AdminNav />
        </header>
        {children}
      </div>
    </main>
  )
}
