import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ExternalLink, Plus } from "lucide-react"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { getAllWorkshopsWithCounts } from "@/lib/workshops/db"
import { AVAILABILITY_MESSAGES, formatFreePlaces, formatWorkshopDate, getAvailability } from "@/lib/workshops/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Работилници | Админ", robots: { index: false, follow: false } }

export default async function AdminWorkshopsPage() {
  if (!(await isAuthenticated())) redirect("/admin")
  const workshops = await getAllWorkshopsWithCounts()

  return (
    <AdminShell
      title="Работилници"
      subtitle="Дати, места, записване и заявки"
      actions={
        <Link
          href="/admin/rabotilnici/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#1F6B5C] px-6 py-3 font-extrabold text-white shadow-sm transition hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          Нова работилница
        </Link>
      }
    >
      <div className="grid gap-4">
        {workshops.map((w) => {
          const availability = getAvailability(w)
          return (
            <article key={w.id} className="flex flex-col gap-4 rounded-[28px] bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#17324D]">{w.title}</h2>
                  {!w.published && <span className="rounded-full bg-[#17324D]/10 px-3 py-1 text-xs font-extrabold text-[#17324D]/60">Чернова</span>}
                </div>
                <p className="mt-1 font-bold text-[#17324D]/55">
                  {`${formatWorkshopDate(w.event_date)} · ${AVAILABILITY_MESSAGES[availability.state]} · Свободни: ${formatFreePlaces(w)}`}
                </p>
                <p className="mt-2 text-sm font-extrabold text-[#17324D]/70">
                  {`Нови: ${w.new_count} · Потвърдени: ${w.confirmed_count} · Отказани: ${w.cancelled_count}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {w.published && (
                  <Link
                    href={`/rabotilnici/${w.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full bg-[#F7FAFC] px-5 py-2.5 font-extrabold text-[#17324D] transition hover:-translate-y-0.5"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Виж на сайта
                  </Link>
                )}
                <Link
                  href={`/admin/rabotilnici/${w.id}`}
                  className="rounded-full bg-[#17324D] px-5 py-2.5 font-extrabold text-white transition hover:-translate-y-0.5"
                >
                  Редакция и заявки
                </Link>
              </div>
            </article>
          )
        })}
        {workshops.length === 0 && <p className="rounded-[28px] bg-white p-8 font-bold text-[#17324D]/55">Няма работилници.</p>}
      </div>
    </AdminShell>
  )
}
