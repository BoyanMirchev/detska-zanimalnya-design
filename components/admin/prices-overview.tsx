"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDownUp, ExternalLink, Pencil, Search } from "lucide-react"
import { inputClass } from "@/components/admin/ui"
import {
  DISPLAY_MODE_LABELS,
  PRICE_CATEGORIES,
  formatAmount,
  getPromotionState,
  priceText,
  type PriceGroup,
  type PriceRecord,
  type PromotionState,
} from "@/lib/pricing/types"

type Row = PriceRecord & { group: PriceGroup }
type SortKey = "order" | "name" | "price" | "updated"

const SORT_LABELS: Record<SortKey, string> = {
  order: "Подредба на сайта",
  name: "Име (А-Я)",
  price: "Цена (възходящо)",
  updated: "Последно променени",
}

const PROMO_LABELS: Record<PromotionState, string | null> = {
  none: null,
  scheduled: "Предстояща промоция",
  active: "Активна промоция",
  expired: "Изтекла промоция",
}

export function PricesOverview({
  groups,
  prices,
  today,
  initialQuery,
}: {
  groups: PriceGroup[]
  prices: PriceRecord[]
  today: string
  initialQuery: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState("")
  const [page, setPage] = useState("")
  const [sort, setSort] = useState<SortKey>("order")

  const groupByKey = useMemo(() => new Map(groups.map((g) => [g.key, g])), [groups])
  const pages = useMemo(() => [...new Set(groups.map((g) => g.page_path))].sort(), [groups])

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("bg")
    const list: Row[] = []
    for (const p of prices) {
      const group = groupByKey.get(p.group_key)
      if (!group) continue
      if (category && group.category !== category) continue
      if (page && group.page_path !== page) continue
      if (q && !`${group.service_name} ${group.title} ${p.label}`.toLocaleLowerCase("bg").includes(q)) continue
      list.push({ ...p, group })
    }
    const byOrder = (a: Row, b: Row) => a.group.sort_order - b.group.sort_order || a.sort_order - b.sort_order || a.id - b.id
    const sorters: Record<SortKey, (a: Row, b: Row) => number> = {
      order: byOrder,
      name: (a, b) => a.group.service_name.localeCompare(b.group.service_name, "bg") || byOrder(a, b),
      price: (a, b) =>
        (a.regular_price === null ? Infinity : Number(a.regular_price)) -
          (b.regular_price === null ? Infinity : Number(b.regular_price)) || byOrder(a, b),
      updated: (a, b) => b.updated_at.localeCompare(a.updated_at),
    }
    return list.sort(sorters[sort])
  }, [prices, groupByKey, query, category, page, sort])

  const sections = PRICE_CATEGORIES.map((c) => ({ category: c, rows: rows.filter((r) => r.group.category === c) })).filter(
    (s) => s.rows.length > 0,
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 rounded-[28px] bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm font-extrabold text-[#17324D]">
          Търсене по име
          <span className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17324D]/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Напр. английски, НВО…"
              className={`${inputClass} pl-10`}
            />
          </span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-extrabold text-[#17324D]">
          Категория
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            <option value="">Всички категории</option>
            {PRICE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-extrabold text-[#17324D]">
          Страница
          <select value={page} onChange={(e) => setPage(e.target.value)} className={inputClass}>
            <option value="">Всички страници</option>
            {pages.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-extrabold text-[#17324D]">
          <span className="inline-flex items-center gap-1.5">
            <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
            Подреждане
          </span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputClass}>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm font-bold text-[#17324D]/60" aria-live="polite">
        {`Показани цени: ${rows.length} от ${prices.length}`}
      </p>

      {sections.length === 0 && (
        <p className="rounded-[28px] bg-white p-8 text-center font-bold text-[#17324D]/60 shadow-sm">
          Няма цени, които отговарят на търсенето.
        </p>
      )}

      {sections.map(({ category: c, rows: list }) => (
        <section key={c} aria-labelledby={`cat-${c}`} className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          <h2 id={`cat-${c}`} className="border-b border-[#17324D]/8 px-6 py-4 text-lg font-extrabold text-[#17324D]">
            {c}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-[#F7FAFC] text-xs font-extrabold uppercase tracking-wide text-[#17324D]/55">
                <tr>
                  <th scope="col" className="px-6 py-3">Услуга / Курс</th>
                  <th scope="col" className="px-4 py-3">Категория</th>
                  <th scope="col" className="px-4 py-3">Страница</th>
                  <th scope="col" className="px-4 py-3">Тип цена</th>
                  <th scope="col" className="px-4 py-3">Текуща цена</th>
                  <th scope="col" className="px-4 py-3">Промоционална цена</th>
                  <th scope="col" className="px-4 py-3">Статус</th>
                  <th scope="col" className="px-6 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17324D]/8">
                {list.map((r) => {
                  const promo = getPromotionState(r, today)
                  return (
                    <tr key={r.id} className="align-top">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-[#17324D]">{r.group.service_name}</p>
                        <p className="mt-0.5 font-bold text-[#17324D]/60">{r.label}</p>
                      </td>
                      <td className="px-4 py-4 font-bold text-[#17324D]/70">{r.group.category}</td>
                      <td className="px-4 py-4 font-bold text-[#17324D]/70">{r.group.page_path}</td>
                      <td className="px-4 py-4 font-bold text-[#17324D]/70">{DISPLAY_MODE_LABELS[r.display_mode]}</td>
                      <td className="px-4 py-4 font-extrabold text-[#17324D]">{priceText(r, today)}</td>
                      <td className="px-4 py-4 font-bold text-[#17324D]/70">
                        {r.promotional_price !== null ? formatAmount(r.promotional_price, r.currency) : "—"}
                        {PROMO_LABELS[promo] && (
                          <span
                            className={`mt-1 block w-fit rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                              promo === "active" ? "bg-[#E8590C]/15 text-[#B5450A]" : "bg-[#17324D]/8 text-[#17324D]/60"
                            }`}
                          >
                            {PROMO_LABELS[promo]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold ${
                            r.is_visible ? "bg-[#9ED9CA]/40 text-[#1F6B5C]" : "bg-[#17324D]/10 text-[#17324D]/60"
                          }`}
                        >
                          {r.is_visible ? "Видима" : "Скрита"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={r.group.page_path}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#F7FAFC] px-4 py-2 font-extrabold text-[#17324D] transition hover:-translate-y-0.5"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            Преглед
                          </Link>
                          <Link
                            href={`/admin/ceni/${r.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#17324D] px-4 py-2 font-extrabold text-white transition hover:-translate-y-0.5"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Редактирай
                            <span className="sr-only">{`${r.group.service_name} — ${r.label}`}</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
