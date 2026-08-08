import { Lock, LogOut, Sparkles } from "lucide-react"
import { getContactRequests, isAuthenticated, logout } from "@/app/actions/admin"
import { AdminLoginForm } from "@/components/admin-login-form"
import { AdminDashboard } from "@/components/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const authed = await isAuthenticated()

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-5 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFB37B]/25 text-[#17324D]">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-[#17324D]">Админ панел</h1>
          <p className="mt-2 font-bold leading-7 text-[#17324D]/60">
            Влезте, за да видите запитванията от контактната форма.
          </p>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
      </main>
    )
  }

  const requests = await getContactRequests()

  return (
    <main className="min-h-screen bg-[#F2F7FB] px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#9ED9CA]/30 px-4 py-1.5 text-sm font-extrabold text-[#1F6B5C]">
              <Sparkles className="h-4 w-4" />
              Малки откриватели
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-[#17324D] sm:text-4xl">Запитвания от клиенти</h1>
            <p className="mt-1 font-bold text-[#17324D]/55">Всички съобщения, изпратени през сайта.</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm transition hover:-translate-y-0.5"
            >
              <LogOut className="h-5 w-5" />
              Изход
            </button>
          </form>
        </header>

        <AdminDashboard requests={requests} />
      </div>
    </main>
  )
}
