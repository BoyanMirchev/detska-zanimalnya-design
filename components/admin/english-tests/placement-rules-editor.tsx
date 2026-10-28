"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { saveLevelDefaults, savePlacementRules } from "@/app/actions/english-tests/admin"
import type { AdminLevel } from "@/lib/english-tests/admin-data"
import type { PlacementMode, PlacementRuleConfig } from "@/lib/english-tests/types"
import { INCONCLUSIVE_MESSAGE } from "@/lib/english-tests/types"
import { Field, FormError, Toast, inputClass, primaryButton } from "@/components/admin/ui"

type Row = { levelId: number; enabled: boolean; minQuestions: number; minPercent: number; bandStart: number }

function evenStarts(count: number) {
  return Array.from({ length: count }, (_, i) => Math.round((i * 100) / count))
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
  const savedMode: PlacementMode | null = rules ? (rules.mode ?? "per_level") : null
  const active = levels.filter((l) => !l.archived || rules?.levels.some((r) => r.levelId === l.id))
  const [mode, setMode] = useState<PlacementMode>(savedMode ?? "score_bands")
  const [rows, setRows] = useState<Row[]>(() => {
    const base = active.map((l) => {
      const existing = rules?.levels.find((r) => r.levelId === l.id)
      return {
        levelId: l.id,
        enabled: rules ? !!existing : true,
        minQuestions: savedMode === "per_level" ? (existing?.minQuestions ?? l.defaultMinQuestions) : l.defaultMinQuestions,
        minPercent: savedMode === "per_level" ? (existing?.minPercent ?? l.defaultMinPercent) : l.defaultMinPercent,
        bandStart: savedMode === "score_bands" && existing ? existing.minPercent : -1,
      }
    })
    if (base.some((r) => r.enabled && r.bandStart < 0)) return withEvenBands(base)
    return base
  })
  const [bulkPercent, setBulkPercent] = useState("")
  const [bulkQuestions, setBulkQuestions] = useState("")
  const [savingDefaults, startDefaults] = useTransition()
  const [minTotal, setMinTotal] = useState(rules?.minTotalAnswered ?? 5)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const update = (levelId: number, patch: Partial<Row>) => setRows((prev) => prev.map((r) => (r.levelId === levelId ? { ...r, ...patch } : r)))
  const enabledRows = rows.filter((r) => r.enabled)
  const nameOf = (id: number) => levels.find((l) => l.id === id)?.name ?? "?"

  function withEvenBands(list: Row[]) {
    const starts = evenStarts(list.filter((r) => r.enabled).length)
    let i = 0
    return list.map((r) => (r.enabled ? { ...r, bandStart: starts[i++] } : r))
  }

  function bandEnd(levelId: number) {
    const index = enabledRows.findIndex((r) => r.levelId === levelId)
    const next = enabledRows[index + 1]
    return next ? Math.max(next.bandStart - 1, 0) : 100
  }

  function save() {
    startTransition(async () => {
      setErrors({})
      setError(null)
      const res = await savePlacementRules(testId, {
        mode,
        minTotalAnswered: minTotal,
        levels: enabledRows.map(({ levelId, minQuestions, minPercent, bandStart }) =>
          mode === "score_bands" ? { levelId, minQuestions: 1, minPercent: bandStart } : { levelId, minQuestions, minPercent },
        ),
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

  function applyToAll() {
    const percent = Number(bulkPercent)
    const questions = Number(bulkQuestions)
    setRows((prev) =>
      prev.map((r) =>
        r.enabled
          ? {
              ...r,
              ...(bulkPercent !== "" && percent >= 1 && percent <= 100 ? { minPercent: Math.round(percent) } : {}),
              ...(bulkQuestions !== "" && questions >= 1 && questions <= 100 ? { minQuestions: Math.round(questions) } : {}),
            }
          : r,
      ),
    )
  }

  function saveAsDefaults() {
    startDefaults(async () => {
      setError(null)
      const res = await saveLevelDefaults(rows.map(({ levelId, minPercent, minQuestions }) => ({ levelId, minPercent, minQuestions })))
      if (!res.ok) {
        setError(res.error ?? "Неуспешно запазване.")
        return
      }
      setToast(res.message ?? "Запазено.")
      router.refresh()
    })
  }

  const modeButton = (value: PlacementMode, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={mode === value}
      onClick={() => setMode(value)}
      className={`rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${
        mode === value ? "bg-[#17324D] text-white" : "text-[#17324D]/70 hover:bg-[#17324D]/5"
      }`}
    >
      {label}
    </button>
  )

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="rules-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 id="rules-title" className="text-lg font-extrabold text-[#17324D]">
            Правила за определяне на ниво
          </h2>
          <p className="max-w-2xl text-sm font-bold leading-relaxed text-[#17324D]/55">
            {mode === "score_bands"
              ? "Задайте от какъв общ резултат (%) започва всяко ниво. Ученикът получава нивото, в чийто диапазон попада общият му резултат от теста."
              : `Нивата се проверяват последователно от най-ниското. Ученикът получава най-високото ниво, при което то и всички по-ниски тествани нива са преминати. Нива без достатъчно въпроси в теста се пропускат. Ако никое ниво не е преминато, резултатът е: „${INCONCLUSIVE_MESSAGE}“`}
          </p>
        </div>
        {rules && <span className="rounded-full bg-[#17324D]/5 px-3 py-1 text-xs font-extrabold text-[#17324D]">Версия {rules.version}</span>}
      </div>

      <div role="radiogroup" aria-label="Начин на определяне" className="flex w-fit flex-wrap gap-1 rounded-full bg-[#F7FAFC] p-1">
        {modeButton("score_bands", "По общ резултат (%)")}
        {modeButton("per_level", "По въпроси от всяко ниво")}
      </div>

      <FormError message={error ?? errors.levels ?? null} />

      {mode === "score_bands" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F7FAFC] p-4">
            <p className="max-w-xl text-sm font-bold leading-relaxed text-[#17324D]/70">
              Променяйте свободно началния процент на всяко ниво. Краят на диапазона се изчислява автоматично от следващото ниво.
            </p>
            <button
              type="button"
              onClick={() => setRows((prev) => withEvenBands(prev))}
              className="rounded-full bg-[#17324D]/5 px-4 py-2 text-sm font-extrabold text-[#17324D] hover:bg-[#17324D]/10"
            >
              Разпредели равномерно
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[#17324D]/55">
                <tr>
                  <th className="py-2 font-extrabold">Включено</th>
                  <th className="py-2 font-extrabold">Ниво</th>
                  <th className="py-2 font-extrabold">От общ резултат (%)</th>
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
                    <td className="py-2">
                      <input
                        type="number"
                        aria-label={`Начален процент за ${nameOf(r.levelId)}`}
                        min={0}
                        max={100}
                        disabled={!r.enabled}
                        value={r.bandStart < 0 ? "" : r.bandStart}
                        onChange={(e) => update(r.levelId, { bandStart: Number(e.target.value) || 0 })}
                        className={`${inputClass} w-24`}
                      />
                    </td>
                    <td className="py-2 text-[#17324D]/70">{r.enabled ? `${bandEnd(r.levelId)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {enabledRows.length > 0 && (
            <p className="rounded-2xl bg-[#17324D]/5 px-4 py-3 text-sm font-bold leading-relaxed text-[#17324D]">
              {enabledRows[0].bandStart > 0
                ? `Под ${enabledRows[0].bandStart}% ученикът няма да получи ниво. `
                : ""}
              Пример: ученик с общ резултат {enabledRows[0].bandStart}–{bandEnd(enabledRows[0].levelId)}% ще получи ниво{" "}
              {nameOf(enabledRows[0].levelId)}.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl bg-[#F7FAFC] p-4">
            <p className="text-sm font-bold leading-relaxed text-[#17324D]/70">
              Всяка стойност в таблицата може да се променя свободно. За бърза промяна задайте обща стойност за всички включени нива.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-extrabold text-[#17324D]/70">
                Праг за всички (%)
                <input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="напр. 60"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                  className={`${inputClass} w-32`}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-extrabold text-[#17324D]/70">
                Мин. въпроси за всички
                <input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="напр. 4"
                  value={bulkQuestions}
                  onChange={(e) => setBulkQuestions(e.target.value)}
                  className={`${inputClass} w-32`}
                />
              </label>
              <button
                type="button"
                onClick={applyToAll}
                disabled={bulkPercent === "" && bulkQuestions === ""}
                className="rounded-full bg-[#17324D] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"
              >
                Приложи към всички
              </button>
            </div>
          </div>

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

          {enabledRows.length > 0 && (
            <p className="rounded-2xl bg-[#17324D]/5 px-4 py-3 text-sm font-bold leading-relaxed text-[#17324D]">
              Пример: ученик, който постигне поне {enabledRows[0].minPercent}% на {nameOf(enabledRows[0].levelId)}
              {enabledRows[1] ? `, но под ${enabledRows[1].minPercent}% на ${nameOf(enabledRows[1].levelId)}` : ""}, ще получи ниво{" "}
              {nameOf(enabledRows[0].levelId)}.
            </p>
          )}
        </>
      )}

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

      <div className="flex flex-wrap justify-end gap-3">
        {mode === "per_level" && (
          <button
            type="button"
            onClick={saveAsDefaults}
            disabled={savingDefaults}
            className="rounded-full bg-[#17324D]/5 px-5 py-2.5 text-sm font-extrabold text-[#17324D] hover:bg-[#17324D]/10 disabled:opacity-50"
          >
            {savingDefaults ? "Запазване…" : "Запази като стойности по подразбиране"}
          </button>
        )}
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
