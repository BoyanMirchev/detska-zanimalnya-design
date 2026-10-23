"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { savePlacementRules } from "@/app/actions/english-tests/admin"
import type { AdminLevel } from "@/lib/english-tests/admin-data"
import type { PlacementRuleConfig } from "@/lib/english-tests/types"
import { INCONCLUSIVE_MESSAGE } from "@/lib/english-tests/types"
import { Field, FormError, Toast, inputClass, primaryButton } from "@/components/admin/ui"

type Row = { levelId: number; enabled: boolean; minQuestions: number; minPercent: number }

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
  const active = levels.filter((l) => !l.archived || rules?.levels.some((r) => r.levelId === l.id))
  const [rows, setRows] = useState<Row[]>(() =>
    active.map((l) => {
      const existing = rules?.levels.find((r) => r.levelId === l.id)
      return { levelId: l.id, enabled: rules ? !!existing : true, minQuestions: existing?.minQuestions ?? 3, minPercent: existing?.minPercent ?? 70 }
    }),
  )
  const [minTotal, setMinTotal] = useState(rules?.minTotalAnswered ?? 5)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const update = (levelId: number, patch: Partial<Row>) => setRows((prev) => prev.map((r) => (r.levelId === levelId ? { ...r, ...patch } : r)))
  const enabledRows = rows.filter((r) => r.enabled)

  function save() {
    startTransition(async () => {
      setErrors({})
      setError(null)
      const res = await savePlacementRules(testId, {
        minTotalAnswered: minTotal,
        levels: enabledRows.map(({ levelId, minQuestions, minPercent }) => ({ levelId, minQuestions, minPercent })),
      })
      if (!res.ok) {
        setErrors(res.errors ?? {})
        setError(res.error ?? null)
        return
      }
      setToast(res.message ?? "Запазено.")
      router.refresh()
    })
  }

  const nameOf = (id: number) => levels.find((l) => l.id === id)?.name ?? "?"

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="rules-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="rules-title" className="text-lg font-extrabold text-[#17324D]">
            Правила за определяне на ниво
          </h2>
          <p className="max-w-2xl text-sm font-bold leading-relaxed text-[#17324D]/55">
            Нивата се проверяват последователно от най-ниското. Ученикът получава най-високото ниво, при което той и всички по-ниски нива са
            преминати. Ако първото ниво не е преминато или няма достатъчно въпроси, резултатът е: „{INCONCLUSIVE_MESSAGE}“
          </p>
        </div>
        {rules && <span className="rounded-full bg-[#17324D]/5 px-3 py-1 text-xs font-extrabold text-[#17324D]">Версия {rules.version}</span>}
      </div>
      <FormError message={error ?? errors.levels ?? null} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[#17324D]/55">
            <tr>
              <th className="py-2 font-extrabold">Включено</th>
              <th className="py-2 font-extrabold">Ниво</th>
              <th className="py-2 font-extrabold">Мин. въпроси от нивото</th>
              <th className="py-2 font-extrabold">Праг за преминаване (%)</th>
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
                <td className="py-2">
                  <input
                    type="number"
                    aria-label={`Минимум въпроси за ${nameOf(r.levelId)}`}
                    min={1}
                    max={100}
                    disabled={!r.enabled}
                    value={r.minQuestions}
                    onChange={(e) => update(r.levelId, { minQuestions: Number(e.target.value) || 0 })}
                    className={`${inputClass} w-24`}
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    aria-label={`Праг за ${nameOf(r.levelId)}`}
                    min={1}
                    max={100}
                    disabled={!r.enabled}
                    value={r.minPercent}
                    onChange={(e) => update(r.levelId, { minPercent: Number(e.target.value) || 0 })}
                    className={`${inputClass} w-24`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Field label="Минимален брой отговорени въпроси общо" htmlFor="rules-min-total" error={errors.minTotalAnswered}>
        <input
          id="rules-min-total"
          type="number"
          min={0}
          max={200}
          value={minTotal}
          onChange={(e) => setMinTotal(Number(e.target.value) || 0)}
          className={`${inputClass} max-w-40`}
        />
      </Field>

      {enabledRows.length > 0 && (
        <p className="rounded-2xl bg-[#17324D]/5 px-4 py-3 text-sm font-bold leading-relaxed text-[#17324D]">
          Пример: ученик, който постигне поне {enabledRows[0].minPercent}% на {nameOf(enabledRows[0].levelId)}
          {enabledRows[1] ? `, но под ${enabledRows[1].minPercent}% на ${nameOf(enabledRows[1].levelId)}` : ""}, ще получи ниво{" "}
          {nameOf(enabledRows[0].levelId)}.
        </p>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={pending} className={primaryButton}>
          {pending ? "Запазване…" : rules ? "Запази нова версия" : "Запази правилата"}
        </button>
      </div>
      <p className="text-xs font-bold text-[#17324D]/50">
        Правилата се версионират — вече завършените опити запазват версията, с която са оценени.
      </p>
      <Toast message={toast} onDone={() => setToast(null)} />
    </section>
  )
}
