import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { getPriceHistory } from "@/lib/pricing/db"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "История на промените | Админ", robots: { index: false, follow: false } }

const dateFormat = new Intl.DateTimeFormat("bg-BG", {
  timeZone: "Europe/Sofia",
  dateStyle: "medium",
  timeStyle: "short",
})

function formatValue(v: string | null): string {
  if (v === null || v === "") return "—"
  return /^\d+(\.\d+)?$/.test(v) ? v.replace(".", ",") : v
}

export default async function AdminPriceHistoryPage() {
  if (!(await isAuthenticated())) redirect("/admin")
  const history = await getPriceHistory()

  return (
    <AdminShell
      title="История на промените"
      subtitle="Последните 300 промени по цените"
      actions={
        <Link
          href="/admin/ceni"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Управление на цени
        </Link>
      }
    >
      {history.length === 0 ? (
        <p className="rounded-[28px] bg-white p-8 text-center font-bold text-[#17324D]/60 shadow-sm">
          Все още няма записани промени.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {history.map((h) => (
            <li key={h.id} className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-extrabold text-[#17324D]">{h.entity_label}</h2>
                <p className="text-sm font-bold text-[#17324D]/55">
                  <time dateTime={h.created_at}>{dateFormat.format(new Date(h.created_at))}</time>
                  {` · ${h.changed_by}`}
                  {h.page_path ? ` · ${h.page_path}` : ""}
                </p>
              </div>
              <table className="mt-4 w-full text-left text-sm">
                <thead className="text-xs font-extrabold uppercase tracking-wide text-[#17324D]/50">
                  <tr>
                    <th scope="col" className="py-1.5 pr-4">Поле</th>
                    <th scope="col" className="py-1.5 pr-4">Предишна стойност</th>
                    <th scope="col" className="py-1.5">Нова стойност</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17324D]/8">
                  {h.changes.map((c, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 font-extrabold text-[#17324D]">{c.field}</td>
                      <td className="py-2 pr-4 font-bold text-[#17324D]/55 line-through decoration-[#17324D]/30">{formatValue(c.from)}</td>
                      <td className="py-2 font-extrabold text-[#1F6B5C]">{formatValue(c.to)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          ))}
        </ol>
      )}
    </AdminShell>
  )
}
