import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Download } from "lucide-react"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { AttentionList, PaymentsSummaryCards } from "@/components/admin/payments-overview"
import { MONTHS_BG, formatDateBG, todayISO } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@/lib/payment-status"
import { getMonthlyPayments, getMonthlyReport, getPaymentsOverview } from "@/lib/students-data"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Отчети за плащания | Админ", robots: { index: false, follow: false } }

const selectClass =
  "rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#17324D] outline-none transition focus:border-[#9ED9CA]"

export default async function PaymentsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  if (!(await isAuthenticated())) redirect("/admin")
  const today = todayISO()
  const currentYear = Number(today.slice(0, 4))
  const params = await searchParams
  const monthParam = Number(params.month)
  const yearParam = Number(params.year)
  const month = Number.isInteger(monthParam) && monthParam >= 1 && monthParam <= 12 ? monthParam : Number(today.slice(5, 7))
  const year = Number.isInteger(yearParam) && yearParam >= 2000 && yearParam <= 2100 ? yearParam : currentYear

  const [overview, report, payments] = await Promise.all([
    getPaymentsOverview(),
    getMonthlyReport(year, month),
    getMonthlyPayments(year, month),
  ])
  const years = Array.from({ length: 6 }, (_, i) => currentYear + 1 - i)

  return (
    <AdminShell title="Отчети за плащания" subtitle="Приходите се отчитат по дата на плащане.">
      <PaymentsSummaryCards overview={overview} />

      <section aria-labelledby="monthly" className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="monthly" className="text-lg font-extrabold text-[#17324D]">
              Месечен отчет
            </h2>
            <p className="text-2xl font-extrabold text-[#17324D]">
              {MONTHS_BG[month - 1]} {year}
            </p>
          </div>
          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm font-extrabold text-[#17324D]">
              Месец
              <select name="month" defaultValue={month} className={selectClass}>
                {MONTHS_BG.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-extrabold text-[#17324D]">
              Година
              <select name="year" defaultValue={year} className={selectClass}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full bg-[#17324D] px-5 py-3 font-extrabold text-white transition hover:-translate-y-0.5"
            >
              Покажи
            </button>
            <a
              href={`/api/admin/payments/export?year=${year}&month=${month}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#17324D]/5 px-5 py-3 font-extrabold text-[#17324D] transition hover:bg-[#17324D]/10"
            >
              <Download className="h-4 w-4" />
              Експорт CSV
            </a>
          </form>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          <ReportCard label="Приходи от занималня" value={formatMoney(report.tuitionTotal)} count={report.tuitionCount} />
          <ReportCard label="Приходи от кетъринг" value={formatMoney(report.cateringTotal)} count={report.cateringCount} />
          <ReportCard label="Общо приходи" value={formatMoney(report.total)} count={report.count} highlight />
        </dl>

        {payments.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[#17324D]/15 px-4 py-10 text-center font-extrabold text-[#17324D]/60">
            Няма плащания за този месец.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#17324D]/8 text-xs font-extrabold uppercase tracking-wide text-[#17324D]/50">
                <tr>
                  <th scope="col" className="py-3 pr-3">Дата</th>
                  <th scope="col" className="px-3 py-3">Ученик</th>
                  <th scope="col" className="px-3 py-3">Тип</th>
                  <th scope="col" className="px-3 py-3 text-right">Сума</th>
                  <th scope="col" className="px-3 py-3">Период</th>
                  <th scope="col" className="py-3 pl-3">Метод</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17324D]/6 font-bold text-[#17324D]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap py-3 pr-3 tabular-nums">{formatDateBG(p.payment_date)}</td>
                    <td className="px-3 py-3">
                      <Link href={`/admin/students/${p.student_id}`} className="font-extrabold hover:text-[#3E8F82]">
                        {p.student_name}
                      </Link>
                    </td>
                    <td className="px-3 py-3">{PAYMENT_TYPE_LABELS[p.type]}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{formatMoney(p.amount)}</td>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums">
                      {formatDateBG(p.period_from)} – {formatDateBG(p.period_to)}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-3">{PAYMENT_METHOD_LABELS[p.payment_method]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AttentionList items={overview.attention} />
    </AdminShell>
  )
}

function ReportCard({ label, value, count, highlight }: { label: string; value: string; count: number; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl px-5 py-4 ${highlight ? "bg-[#17324D] text-white" : "bg-[#F7FAFC] text-[#17324D]"}`}>
      <dt className={`text-sm font-extrabold ${highlight ? "text-white/75" : "text-[#17324D]/55"}`}>{label}</dt>
      <dd className="mt-1 text-2xl font-extrabold tabular-nums">{value}</dd>
      <dd className={`text-sm font-bold ${highlight ? "text-white/70" : "text-[#17324D]/55"}`}>
        {count} {count === 1 ? "плащане" : "плащания"}
      </dd>
    </div>
  )
}
