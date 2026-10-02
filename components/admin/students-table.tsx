"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Plus, Search } from "lucide-react"
import { formatDateBG } from "@/lib/dates"
import { formatMoney } from "@/lib/money"
import { getPaymentStatus, type PaymentStatus } from "@/lib/payment-status"
import type { StudentRow } from "@/lib/students-db"
import { CLASS_OPTIONS } from "@/lib/student-validation"
import { StudentFormDialog } from "@/components/admin/student-form-dialog"
import { StatusBadge, Toast, inputClass, primaryButton } from "@/components/admin/ui"

const FILTERS = [
  { value: "all", label: "Всички" },
  { value: "paid", label: "Платени" },
  { value: "overdue", label: "Просрочени" },
  { value: "expiring", label: "Изтича до 7 дни" },
  { value: "no_tuition", label: "Без платена такса" },
  { value: "no_catering", label: "Без платен кетъринг" },
] as const
type FilterValue = (typeof FILTERS)[number]["value"]

type Row = StudentRow & { tuitionStatus: PaymentStatus; cateringStatus: PaymentStatus }

function matchesFilter(r: Row, filter: FilterValue) {
  const { tuitionStatus: t, cateringStatus: c } = r
  switch (filter) {
    case "paid":
      return t !== "none" && t !== "overdue" && c !== "overdue"
    case "overdue":
      return t === "overdue" || c === "overdue"
    case "expiring":
      return t === "expiring" || c === "expiring"
    case "no_tuition":
      return t === "none"
    case "no_catering":
      return c === "none"
    default:
      return true
  }
}

export function StudentsTable({ students, today }: { students: StudentRow[]; today: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterValue>("all")
  const [classFilter, setClassFilter] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const clearToast = useCallback(() => setToast(null), [])

  const rows: Row[] = useMemo(
    () =>
      students.map((s) => ({
        ...s,
        tuitionStatus: getPaymentStatus(s.tuition_to, today),
        cateringStatus: getPaymentStatus(s.catering_to, today),
      })),
    [students, today],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qDigits = q.replace(/\D/g, "")
    return rows.filter((r) => {
      if (!showInactive && !r.active) return false
      if (classFilter && r.class !== classFilter) return false
      if (!matchesFilter(r, filter)) return false
      if (!q) return true
      const haystack = `${r.first_name} ${r.last_name} ${r.parent_name}`.toLowerCase()
      return haystack.includes(q) || (qDigits.length >= 3 && r.parent_phone.replace(/\D/g, "").includes(qDigits))
    })
  }, [rows, query, filter, classFilter, showInactive])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#17324D]/40" />
            <label htmlFor="student-search" className="sr-only">
              Търси ученик или родител
            </label>
            <input
              id="student-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Търси ученик или родител..."
              className={`${inputClass} pl-12`}
            />
          </div>
          <label htmlFor="class-filter" className="sr-only">
            Клас
          </label>
          <select
            id="class-filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className={`${inputClass} md:w-48`}
          >
            <option value="">Всички класове</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setAdding(true)} className={primaryButton}>
            <Plus className="h-5 w-5" />
            Добави ученик
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                filter === f.value ? "bg-[#17324D] text-white" : "bg-[#17324D]/5 text-[#17324D] hover:bg-[#17324D]/10"
              }`}
            >
              {f.label}
            </button>
          ))}
          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm font-extrabold text-[#17324D]/70">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 accent-[#17324D]"
            />
            Покажи неактивни
          </label>
        </div>
      </div>

      <p className="text-sm font-bold text-[#17324D]/55">
        {filtered.length} {filtered.length === 1 ? "ученик" : "ученици"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#17324D]/15 bg-white px-6 py-16 text-center">
          <p className="font-extrabold text-[#17324D]">
            {students.length === 0 ? "Все още няма добавени ученици." : "Няма ученици, отговарящи на търсенето."}
          </p>
          {students.length === 0 && (
            <p className="mt-1 font-bold text-[#17324D]/55">Натиснете „Добави ученик“, за да започнете.</p>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-3xl bg-white shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#17324D]/8 text-xs font-extrabold uppercase tracking-wide text-[#17324D]/50">
                <tr>
                  <th scope="col" className="px-5 py-4">Ученик</th>
                  <th scope="col" className="px-3 py-4">Клас</th>
                  <th scope="col" className="px-3 py-4">Родител</th>
                  <th scope="col" className="px-3 py-4">Телефон</th>
                  <th scope="col" className="px-3 py-4 text-right">Такса занималня</th>
                  <th scope="col" className="px-3 py-4">Платено до</th>
                  <th scope="col" className="px-3 py-4 text-right">Кетъринг</th>
                  <th scope="col" className="px-3 py-4">Кетъринг платен до</th>
                  <th scope="col" className="px-3 py-4">Статус</th>
                  <th scope="col" className="px-5 py-4"><span className="sr-only">Действия</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17324D]/6 font-bold text-[#17324D]">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/admin/students/${r.id}`)}
                    className={`cursor-pointer transition hover:bg-[#F7FAFC] ${r.active ? "" : "opacity-55"}`}
                  >
                    <td className="px-5 py-4 font-extrabold">
                      {r.first_name} {r.last_name}
                      {!r.active && <span className="ml-2 text-xs text-[#17324D]/50">(неактивен)</span>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">{r.class}</td>
                    <td className="px-3 py-4">{r.parent_name}</td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <a href={`tel:${r.parent_phone}`} onClick={(e) => e.stopPropagation()} className="hover:text-[#3E8F82]">
                        {r.parent_phone}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">{formatMoney(r.tuition_amount)}</td>
                    <td className="whitespace-nowrap px-3 py-4 tabular-nums">{formatDateBG(r.tuition_to)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">{formatMoney(r.catering_amount)}</td>
                    <td className="whitespace-nowrap px-3 py-4 tabular-nums">{formatDateBG(r.catering_to)}</td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs text-[#17324D]/50">
                          <span className="w-8">Зан.</span>
                          <StatusBadge status={r.tuitionStatus} />
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#17324D]/50">
                          <span className="w-8">Кет.</span>
                          <StatusBadge status={r.cateringStatus} />
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/students/${r.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#17324D]/5 px-4 py-2 text-sm font-extrabold transition hover:bg-[#17324D]/10"
                      >
                        Отвори
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/students/${r.id}`}
                  className={`block rounded-3xl border-2 border-[#17324D]/8 bg-white p-5 shadow-sm transition hover:border-[#17324D]/15 ${
                    r.active ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold text-[#17324D]">
                        {r.first_name} {r.last_name}
                      </p>
                      <p className="text-sm font-bold text-[#17324D]/60">
                        {r.class} · {r.parent_name} · {r.parent_phone}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#17324D]/40" />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col gap-1 rounded-2xl bg-[#F7FAFC] p-3">
                      <dt className="font-extrabold text-[#17324D]/55">Занималня</dt>
                      <dd className="font-extrabold text-[#17324D]">{formatMoney(r.tuition_amount)}</dd>
                      <dd className="font-bold text-[#17324D]/70">до {formatDateBG(r.tuition_to)}</dd>
                      <dd><StatusBadge status={r.tuitionStatus} /></dd>
                    </div>
                    <div className="flex flex-col gap-1 rounded-2xl bg-[#F7FAFC] p-3">
                      <dt className="font-extrabold text-[#17324D]/55">Кетъринг</dt>
                      <dd className="font-extrabold text-[#17324D]">{formatMoney(r.catering_amount)}</dd>
                      <dd className="font-bold text-[#17324D]/70">до {formatDateBG(r.catering_to)}</dd>
                      <dd><StatusBadge status={r.cateringStatus} /></dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <StudentFormDialog
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(id) => {
          setToast("Ученикът беше добавен успешно.")
          if (id) router.push(`/admin/students/${id}`)
        }}
      />
      <Toast message={toast} onDone={clearToast} />
    </div>
  )
}
