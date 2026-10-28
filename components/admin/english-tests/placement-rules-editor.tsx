"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { savePlacementRules } from "@/app/actions/english-tests/admin"
import type { AdminLevel } from "@/lib/english-tests/admin-data"
import type { PlacementRuleConfig } from "@/lib/english-tests/types"
import { bandMax } from "@/lib/english-tests/grading"
import { FormError, Toast, inputClass, primaryButton } from "@/components/admin/ui"

type Row = { levelId: number; enabled: boolean; from: string; to: string }

function evenRanges(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    from: Math.round((i * 100) / count),
    to: i === count - 1 ? 100 : Math.round(((i + 1) * 100) / count) - 1,
  }))
}

function distribute(list: Row[]) {
  const ranges = evenRanges(list.filter((r) => r.enabled).length)
  let i = 0
  return list.map((r) => {
    if (!r.enabled) return r
    const range = ranges[i++]
    return { ...r, from: String(range.from), to: String(range.to) }
  })
}

export function PlacementRulesEditor({
  testId,
  levels,
  rules,
}: {
  testId: number
  levels: AdminLevel[]
  rules: (PlacementRuleConfig & { version: number }) | null
}) {
  const router = useRouter()
  const usesRanges = rules?.mode === "score_bands"
  const active = levels.filter((l) => !l.archived || rules?.levels.some((r) => r.levelId === l.id))
  const [rows, setRows] = useState<Row[]>(() => {
    const base = active.map((l) => {
      const index = rules?.levels.findIndex((r) => r.levelId === l.id) ?? -1
      const existing = index >= 0 ? rules!.levels[index] : null
      return {
        levelId: l.id,
        enabled: rules ? !!existing : true,
        from: usesRanges && existing ? String(existing.minPercent) : "",
        to: usesRanges && existing ? String(bandMax(rules!.levels, index)) : "",
      }
    })
    return usesRanges ? base : distribute(base)
  })
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const update = (levelId: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.levelId === levelId ? { ...r, ...patch } : r)))
  const nameOf = (id: number) => levels.find((l) => l.id === id)?.name ?? "?"
  const enabledRows = rows.filter((r) => r.enabled)

  function save() {
    startTransition(async () => {
      setError(null)
      const res = await savePlacementRules(testId, {
        mode: "score_bands",
        minTotalAnswered: 0,
        levels: enabledRows.map((r) => ({
          levelId: r.levelId,
          minQuestions: 1,
          minPercent: r.from === "" ? NaN : Number(r.from),
          maxPercent: r.to === "" ? NaN : Number(r.to),
        })),
      })
      if (!res.ok) {
        setError(res.errors?.levels ?? res.error ?? "Неуспешно запазване.")
        return
      }
      setToast(res.message ?? "Запазено.")
      router.refresh()
    })
  }

  const percentInput = (r: Row, key: "from" | "to", label: string) => (
    <input
      type="number"
      inputMode="numeric"
      aria-label={`${label} за ${nameOf(r.levelId)}`}
      min={0}
      max={100}
      disabled={!r.enabled}
      value={r[key]}
      onChange={(e) => update(r.levelId, { [key]: e.target.value })}
      className={`${inputClass} w-24`}
    />
  )

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="rules-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 id="rules-title" className="text-lg font-extrabold text-[#17324D]">
            Нива според резултата
          </h2>
          <p className="max-w-2xl text-sm font-bold leading-relaxed text-[#17324D]/55">
            Задайте от колко до колко процента е всяко ниво. След теста ученикът автоматично получава нивото, в което попада общият му резултат.
          </p>
        </div>
        {rules && <span className="rounded-full bg-[#17324D]/5 px-3 py-1 text-xs font-extrabold text-[#17324D]">Версия {rules.version}</span>}
      </div>

      <FormError message={error} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[#17324D]/55">
            <tr>
              <th className="py-2 font-extrabold">Включено</th>
              <th className="py-2 font-extrabold">Ниво</th>
              <th className="py-2 font-extrabold">От (%)</th>
              <th className="py-2 font-extrabold">До (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17324D]/6 font-bold text-[#17324D]">
            {rows.map((r) => (
              <tr key={r.levelId} className={r.enabled ? undefined : "opacity-50"}>
                <td className="py-2">
                  <input
                    type="checkbox"
                    aria-label={`Включи ${nameOf(r.levelId)}`}
                    checked={r.enabled}
                    onChange={(e) => update(r.levelId, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-[#DD5B26]"
                  />
                </td>
                <td className="py-2 font-extrabold">{nameOf(r.levelId)}</td>
                <td className="py-2">{percentInput(r, "from", "От")}</td>
                <td className="py-2">{percentInput(r, "to", "До")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {enabledRows[0] && enabledRows[0].from !== "" && enabledRows[0].to !== "" && (
        <p className="rounded-2xl bg-[#17324D]/5 px-4 py-3 text-sm font-bold leading-relaxed text-[#17324D]">
          Пример: ученик с резултат от {enabledRows[0].from}% до {enabledRows[0].to}% получава ниво {nameOf(enabledRows[0].levelId)}.
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => setRows((prev) => distribute(prev))}
          className="rounded-full bg-[#17324D]/5 px-5 py-2.5 text-sm font-extrabold text-[#17324D] hover:bg-[#17324D]/10"
        >
          Разпредели равномерно
        </button>
        <button type="button" onClick={save} disabled={pending} className={primaryButton}>
          {pending ? "Запазване…" : "Запази"}
        </button>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </section>
  )
}
