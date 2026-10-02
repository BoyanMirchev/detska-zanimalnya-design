import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { formatDateBG } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import { PAYMENT_TYPE_LABELS } from "@/lib/payment-status"
import type { AttentionItem, PaymentsOverview as Overview } from "@/lib/students-data"

const ATTENTION_STYLES: Record<AttentionItem["status"], string> = {
  overdue: "bg-[#F27B6B]/20 text-[#C7503F]",
  expiring: "bg-[#FFB37B]/30 text-[#9A5A21]",
  none: "bg-[#17324D]/8 text-[#17324D]/60",
}

function attentionText(item: AttentionItem) {
  if (item.status === "overdue") return `Просрочено от ${formatDateBG(item.paidUntil)}`
  if (item.status === "expiring") return `Изтича на ${formatDateBG(item.paidUntil)}`
  return "Няма плащане"
}

export function PaymentsSummaryCards({ overview }: { overview: Overview }) {
  const cards = [
    { label: "Активни ученици", value: String(overview.activeStudents), href: "/admin/students" },
    { label: "Платени", value: String(overview.paid), tone: "text-[#1F6B5C]", href: "/admin/students" },
    { label: "Просрочени", value: String(overview.overdue), tone: "text-[#C7503F]", href: "/admin/students" },
    { label: "Изтичат до 7 дни", value: String(overview.expiring), tone: "text-[#9A5A21]", href: "/admin/students" },
    { label: "Приходи този месец", value: formatMoney(overview.revenueThisMonth), href: "/admin/payments" },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((c, i) => (
        <Link
          key={c.label}
          href={c.href}
          className={`flex flex-col items-start gap-1 rounded-3xl border-2 border-[#17324D]/8 bg-white px-5 py-4 transition hover:border-[#17324D]/20 ${
            i === cards.length - 1 ? "col-span-2 md:col-span-1" : ""
          }`}
        >
          <span className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${c.tone ?? "text-[#17324D]"}`}>{c.value}</span>
          <span className="text-sm font-extrabold text-[#17324D]/55">{c.label}</span>
        </Link>
      ))}
    </div>
  )
}

export function AttentionList({ items, limit }: { items: AttentionItem[]; limit?: number }) {
  const shown = limit ? items.slice(0, limit) : items
  return (
    <section aria-labelledby="attention" className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="attention" className="text-lg font-extrabold text-[#17324D]">
          Плащания за внимание
        </h2>
        <span className="rounded-full bg-[#17324D]/5 px-3 py-1 text-sm font-extrabold text-[#17324D]">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-[#9ED9CA]/20 px-4 py-3 font-bold text-[#1F6B5C]">
          Всички активни ученици са с платени такси.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[#17324D]/6">
          {shown.map((item) => (
            <li key={`${item.studentId}-${item.type}`}>
              <Link
                href={`/admin/students/${item.studentId}`}
                className="-mx-2 flex items-center justify-between gap-3 rounded-2xl px-2 py-3 transition hover:bg-[#F7FAFC]"
              >
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-[#17324D]">{item.studentName}</p>
                  <p className="text-sm font-bold text-[#17324D]/55">
                    {item.type === "TUITION" ? "Такса занималня" : PAYMENT_TYPE_LABELS[item.type]} · {item.className}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${ATTENTION_STYLES[item.status]}`}>
                    {attentionText(item)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#17324D]/40" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {limit && items.length > limit && (
        <Link href="/admin/students" className="mt-3 inline-flex text-sm font-extrabold text-[#3E8F82] hover:underline">
          Виж всички ({items.length})
        </Link>
      )}
    </section>
  )
}
