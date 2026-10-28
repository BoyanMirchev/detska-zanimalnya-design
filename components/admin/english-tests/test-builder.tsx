"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, PenSquare, Replace, Users, X } from "lucide-react"
import { saveTest } from "@/app/actions/english-tests/admin"
import type { AdminLevel, AdminTestDetail, PickerQuestion } from "@/lib/english-tests/admin-data"
import {
  DEFAULT_TEST_SETTINGS,
  EMPTY_SELECTION_CONFIG,
  LABELS,
  type SelectionConfig,
  type SelectionMethod,
  type TestSettings,
  type TestType,
} from "@/lib/english-tests/types"
import { percentsToCounts } from "@/lib/english-tests/allocation"
import { Field, FormError, Toast, inputClass, primaryButton } from "@/components/admin/ui"

const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-extrabold text-[#17324D]">{title}</h2>
        {description && <p className="text-sm font-bold leading-relaxed text-[#17324D]/55">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
        active ? "bg-[#17324D] text-white" : "bg-[#17324D]/5 text-[#17324D] hover:bg-[#17324D]/10"
      }`}
    >
      {children}
    </button>
  )
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[#DD5B26]" />
      <span className="flex flex-col">
        <span className="font-extrabold text-[#17324D]">{label}</span>
        {hint && <span className="text-xs font-bold text-[#17324D]/55">{hint}</span>}
      </span>
    </label>
  )
}

export function TestBuilder({
  test,
  levels,
  questions,
}: {
  test: AdminTestDetail | null
  levels: AdminLevel[]
  questions: PickerQuestion[]
}) {
  const router = useRouter()
  const activeLevels = levels.filter((l) => !l.archived)
  const [testType, setTestType] = useState<TestType>(test?.testType ?? "placement")
  const [levelId, setLevelId] = useState<number | null>(test?.levelId ?? null)
  const [method, setMethod] = useState<SelectionMethod>(test?.selectionMethod ?? "random")
  const [config, setConfig] = useState<SelectionConfig>(test?.selectionConfig ?? EMPTY_SELECTION_CONFIG)
  const [questionIds, setQuestionIds] = useState<number[]>(test?.questionIds ?? [])
  const [questionCount, setQuestionCount] = useState(test?.questionCount ?? 20)
  const [settings, setSettings] = useState<TestSettings>(test?.settings ?? DEFAULT_TEST_SETTINGS)
  const [pickerFilter, setPickerFilter] = useState({ q: "", level: 0 })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [replacingId, setReplacingId] = useState<number | null>(null)
  const [previewIds, setPreviewIds] = useState<number[]>([])
  const [formTouched, setFormTouched] = useState(false)

  const stateSnapshot = JSON.stringify({ testType, levelId, method, config, questionIds, questionCount, settings })
  const initialSnapshot = useRef(stateSnapshot)
  const dirty = formTouched || stateSnapshot !== initialSnapshot.current
  const allowLeave = useRef(false)
  const LEAVE_PROMPT = "Имате незапазени промени. Сигурни ли сте, че искате да напуснете страницата?"

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowLeave.current) return
      e.preventDefault()
      e.returnValue = ""
    }
    // Client-side navigation (Next Link) doesn't fire beforeunload, so intercept internal link clicks too.
    const onClick = (e: MouseEvent) => {
      if (allowLeave.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const anchor = (e.target as HTMLElement).closest("a")
      if (!anchor || anchor.target === "_blank" || !anchor.href || anchor.href.startsWith("#")) return
      if (!window.confirm(LEAVE_PROMPT)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [dirty])

  function cancel() {
    if (dirty && !window.confirm(LEAVE_PROMPT)) return
    allowLeave.current = true
    router.push("/admin/english-tests/tests")
  }

  function moveQuestion(index: number, delta: -1 | 1) {
    setQuestionIds((ids) => {
      const target = index + delta
      if (target < 0 || target >= ids.length) return ids
      const next = [...ids]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function pickFromBank(id: number) {
    if (replacingId !== null) {
      if (!questionIds.includes(id)) setQuestionIds((ids) => ids.map((x) => (x === replacingId ? id : x)))
      setReplacingId(null)
      return
    }
    setQuestionIds((ids) => toggleIn(ids, id))
  }

  const otherTests = (q: PickerQuestion) => q.tests.filter((t) => t.id !== test?.id)

  const set = <K extends keyof TestSettings>(key: K, value: TestSettings[K]) => setSettings((s) => ({ ...s, [key]: value }))

  const effectiveLevelIds = testType === "level" && levelId ? [levelId] : config.levelIds
  const useAllocations = method === "random" && testType === "placement" && config.allocations.length > 0
  const percentTotal = config.allocations.reduce((sum, a) => sum + a.percent, 0)
  const allocationCounts = useMemo(
    () => new Map(percentsToCounts(config.allocations, questionCount).map((a) => [a.levelId, a.count])),
    [config.allocations, questionCount],
  )

  const pool = useMemo(
    () =>
      questions.filter(
        (q) => effectiveLevelIds.length === 0 || (q.levelId != null && effectiveLevelIds.includes(q.levelId)),
      ),
    [questions, effectiveLevelIds],
  )
  const poolByLevel = useMemo(() => {
    const map = new Map<number, number>()
    for (const q of pool) if (q.levelId != null) map.set(q.levelId, (map.get(q.levelId) ?? 0) + 1)
    return map
  }, [pool])

  const pickerRows = useMemo(() => {
    const term = pickerFilter.q.trim().toLowerCase()
    return questions.filter(
      (q) =>
        (testType !== "level" || !levelId || q.levelId === levelId) &&
        (!pickerFilter.level || q.levelId === pickerFilter.level) &&
        (!term || q.text.toLowerCase().includes(term)),
    )
  }, [questions, pickerFilter, testType, levelId])

  const selectedQuestions = questionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean) as PickerQuestion[]
  const finalCount = method === "manual" ? questionIds.length : questionCount
  const poolShortfall = method === "random" && pool.length < questionCount
  const percentOver = useAllocations && percentTotal > 100

  function setAllocation(id: number, percent: number) {
    setConfig((c) => {
      const others = c.allocations.filter((a) => a.levelId !== id)
      return { ...c, allocations: percent > 0 ? [...others, { levelId: id, percent }] : others }
    })
  }

  function submit(form: FormData) {
    startTransition(async () => {
      setErrors({})
      setError(null)
      const res = await saveTest(test?.id ?? null, {
        title: form.get("title"),
        description: form.get("description"),
        testType,
        levelId: testType === "level" ? levelId : null,
        durationMinutes: form.get("durationMinutes"),
        questionCount,
        selectionMethod: method,
        selectionConfig:
          testType === "level"
            ? { ...config, difficulties: [], levelIds: [], allocations: [] }
            : useAllocations
              ? { ...config, difficulties: [] }
              : { ...config, difficulties: [], allocations: [] },
        questionIds,
        settings,
        availableFrom: "",
        availableUntil: "",
        expectedVersion: test?.editVersion,
      })
      if (!res.ok) {
        setErrors(res.errors ?? {})
        setError(res.error ?? "Моля, коригирайте маркираните полета.")
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      allowLeave.current = true
      if (!test && res.data) {
        router.replace(`/admin/english-tests/${res.data.id}/edit`)
        return
      }
      const hidden = res.message?.includes("скрит")
      router.push(`/admin/english-tests/tests?saved=${hidden ? "hidden" : "1"}`)
    })
  }

  return (
    <form
      action={submit}
      onChange={(e) => {
        if ((e.target as HTMLElement).closest("[data-ignore-dirty]")) return
        setFormTouched(true)
      }}
      className="flex flex-col gap-4"
    >
      <FormError message={error} />
      {test && test.attemptCount > 0 && (
        <p className="rounded-2xl bg-[#9ED9CA]/25 px-4 py-3 text-sm font-bold text-[#1F6B5C]">
          Тестът има {test.attemptCount} опита
          {test.activeAttemptCount > 0 ? `, от които ${test.activeAttemptCount} в момента се решават` : ""}. Промените важат само за нови опити —
          започнатите и завършените опити запазват своите въпроси, отговори, правила за оценяване и краен срок.
        </p>
      )}

      <Section title="Основна информация">
        <Field label="Заглавие" htmlFor="t-title" error={errors.title} required>
          <input id="t-title" name="title" maxLength={150} defaultValue={test?.title} className={inputClass} required />
        </Field>
        <Field label="Описание за учениците" htmlFor="t-desc" error={errors.description}>
          <textarea id="t-desc" name="description" rows={3} maxLength={2000} defaultValue={test?.description} className={inputClass} />
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-extrabold text-[#17324D]">Тип тест</legend>
          <div className="flex flex-wrap gap-2">
            {(["placement", "level"] as const).map((t) => (
              <Chip key={t} active={testType === t} onClick={() => setTestType(t)}>
                {LABELS.testType[t]}
              </Chip>
            ))}
          </div>
          <p className="text-xs font-bold text-[#17324D]/55">
            {testType === "placement"
              ? "Смесва въпроси от няколко нива и определя приблизителното ниво по конфигурируеми правила."
              : "Проверява дали ученикът владее едно конкретно ниво."}
          </p>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          {testType === "level" && (
            <Field label="Ниво" htmlFor="t-level" error={errors.levelId} required>
              <select
                id="t-level"
                value={levelId ?? ""}
                onChange={(e) => setLevelId(Number(e.target.value) || null)}
                className={inputClass}
                required
              >
                <option value="">Изберете</option>
                {activeLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Време (минути)" htmlFor="t-duration" error={errors.durationMinutes} required>
            <input
              id="t-duration"
              name="durationMinutes"
              type="number"
              min={1}
              max={300}
              defaultValue={test?.durationMinutes ?? 30}
              className={inputClass}
              required
            />
          </Field>
        </div>
      </Section>

      <Section title="Въпроси в теста" description="Изберете конкретни въпроси или оставете системата да подбере случайни от банката по критерии.">
        <div className="flex flex-wrap gap-2">
          {(["random", "manual"] as const).map((m) => (
            <Chip key={m} active={method === m} onClick={() => setMethod(m)}>
              {LABELS.selectionMethod[m]}
            </Chip>
          ))}
        </div>

        {method === "random" ? (
          <div className="flex flex-col gap-4">
            {testType === "placement" && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-extrabold text-[#17324D]">Нива (празно = всички)</legend>
                <div className="flex flex-wrap gap-2">
                  {activeLevels.map((l) => (
                    <Chip key={l.id} active={config.levelIds.includes(l.id)} onClick={() => setConfig((c) => ({ ...c, levelIds: toggleIn(c.levelIds, l.id) }))}>
                      {l.name}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}

            <Field label="Общ брой въпроси" htmlFor="t-count" error={errors.questionCount}>
              <input
                id="t-count"
                type="number"
                min={1}
                max={200}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value) || 0)}
                className={`${inputClass} max-w-40`}
              />
            </Field>

            {testType === "placement" ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-extrabold text-[#17324D]">Процент въпроси по ниво</p>
                  <p
                    className={`text-sm font-extrabold ${percentOver ? "text-[#C7503F]" : "text-[#17324D]/70"}`}
                    role="status"
                  >
                    Общо: {percentTotal}%
                  </p>
                </div>
                <p className="text-xs font-bold text-[#17324D]/55">
                  Задайте какъв процент от въпросите да бъде от всяко ниво. Ако оставите всички на 0%, въпросите се подбират случайно от всички нива.
                </p>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {activeLevels
                    .filter((l) => config.levelIds.length === 0 || config.levelIds.includes(l.id))
                    .map((l) => {
                      const percent = config.allocations.find((a) => a.levelId === l.id)?.percent ?? 0
                      const count = allocationCounts.get(l.id) ?? 0
                      const available = poolByLevel.get(l.id) ?? 0
                      return (
                        <li key={l.id} className="flex items-center gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-2">
                          <label htmlFor={`alloc-${l.id}`} className="flex-1 font-extrabold text-[#17324D]">
                            {l.name}
                            <span className={`block text-xs ${count > available ? "text-[#C7503F]" : "text-[#17324D]/50"}`}>
                              {count} {count === 1 ? "въпрос" : "въпроса"} · налични: {available}
                            </span>
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              id={`alloc-${l.id}`}
                              type="number"
                              min={0}
                              max={100}
                              value={percent}
                              onChange={(e) => setAllocation(l.id, Math.min(100, Math.max(0, Math.round(Number(e.target.value) || 0))))}
                              className={`${inputClass} w-20`}
                            />
                            <span aria-hidden="true" className="font-extrabold text-[#17324D]/60">
                              %
                            </span>
                          </div>
                        </li>
                      )
                    })}
                </ul>
                {(percentOver || errors.allocations) && (
                  <p className="text-sm font-bold text-[#C7503F]">
                    {errors.allocations ?? "Сборът от процентите не може да надвишава 100%."}
                  </p>
                )}
                {useAllocations && !percentOver && percentTotal < 100 && (
                  <p className="text-xs font-bold text-[#17324D]/55">
                    Останалите {100 - percentTotal}% се подбират случайно от нивата без зададен процент.
                  </p>
                )}
              </div>
            ) : null}
            <p
              className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                poolShortfall ? "bg-[#F27B6B]/15 text-[#C7503F]" : "bg-[#17324D]/5 text-[#17324D]"
              }`}
              role="status"
            >
              Подходящи активни въпроси в банката: {pool.length}.{" "}
              {poolShortfall
                ? `Недостатъчно за ${questionCount} въпроса — добавете въпроси или разширете критериите.`
                : "Всеки ученик ще получи различен случаен набор."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2" data-ignore-dirty>
              {replacingId !== null && (
                <div role="status" className="flex items-center justify-between gap-2 rounded-2xl bg-[#DD5B26]/10 px-4 py-2 text-sm font-bold text-[#B5461C]">
                  <span>
                    Изберете въпрос от банката, който да замени въпрос №{questionIds.indexOf(replacingId) + 1}.
                  </span>
                  <button type="button" onClick={() => setReplacingId(null)} className="rounded-full px-2 font-extrabold hover:bg-[#DD5B26]/15">
                    Отказ
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  aria-label="Търсене на въпрос"
                  placeholder="Търсене…"
                  value={pickerFilter.q}
                  onChange={(e) => setPickerFilter((f) => ({ ...f, q: e.target.value }))}
                  className={`${inputClass} flex-1`}
                />
                {testType === "placement" && (
                  <select
                    aria-label="Филтър по ниво"
                    value={pickerFilter.level}
                    onChange={(e) => setPickerFilter((f) => ({ ...f, level: Number(e.target.value) }))}
                    className={inputClass}
                  >
                    <option value={0}>Всички нива</option>
                    {activeLevels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto rounded-2xl bg-[#F7FAFC] p-2" aria-label="Банка с въпроси">
                {pickerRows.length === 0 && <li className="p-3 text-sm font-bold text-[#17324D]/55">Няма активни въпроси.</li>}
                {pickerRows.map((q) => {
                  const selected = questionIds.includes(q.id)
                  const shared = otherTests(q).length
                  return (
                    <li key={q.id}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-white ${
                          replacingId !== null && selected ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={replacingId !== null && selected}
                          onChange={() => pickFromBank(q.id)}
                          className="mt-1 h-4 w-4 accent-[#DD5B26]"
                        />
                        <span className="flex min-w-0 flex-col">
                          <span lang="en" className="line-clamp-2 text-sm font-bold text-[#17324D]">
                            {q.text}
                          </span>
                          <span className="text-xs font-bold text-[#17324D]/50">
                            {q.levelName}
                            {shared > 0 && ` · в още ${shared} ${shared === 1 ? "тест" : "теста"}`}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-extrabold text-[#17324D]">
                Избрани: {questionIds.length} въпроса
              </p>
              {errors.questionIds && (
                <p role="alert" className="text-sm font-bold text-[#C7503F]">
                  {errors.questionIds}
                </p>
              )}
              {questionIds.length > selectedQuestions.length && (
                <p role="alert" className="rounded-2xl bg-[#F27B6B]/15 px-4 py-2 text-sm font-bold text-[#C7503F]">
                  {questionIds.length - selectedQuestions.length} от избраните въпроси вече не са активни в банката. Премахнете ги ��ли ги
                  заменете, преди да запазите.
                </p>
              )}
              <ol className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto rounded-2xl border-2 border-dashed border-[#17324D]/10 p-2">
                {selectedQuestions.length === 0 && <li className="p-3 text-sm font-bold text-[#17324D]/55">Изберете въпроси от списъка.</li>}
                {selectedQuestions.map((q, i) => {
                  const shared = otherTests(q)
                  const previewing = previewIds.includes(q.id)
                  const replacing = replacingId === q.id
                  const iconButton = "inline-flex h-8 w-8 items-center justify-center rounded-full text-[#17324D]/70 hover:bg-[#17324D]/10 disabled:opacity-30"
                  return (
                    <li
                      key={q.id}
                      className={`flex flex-col gap-2 rounded-xl bg-white px-3 py-2 shadow-sm ${replacing ? "ring-2 ring-[#DD5B26]" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 pt-1 text-xs font-extrabold text-[#17324D]/40">{i + 1}.</span>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span lang="en" className="line-clamp-2 text-sm font-bold text-[#17324D]">
                            {q.text}
                          </span>
                          <span className="text-xs font-bold text-[#17324D]/50">
                            {q.levelName}
                          </span>
                          {shared.length > 0 && (
                            <span
                              className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[#9ED9CA]/30 px-2 py-0.5 text-xs font-extrabold text-[#1F6B5C]"
                              title={shared.map((t) => t.title).join(", ")}
                            >
                              <Users className="h-3 w-3" aria-hidden="true" />
                              Използва се и в {shared.length} {shared.length === 1 ? "друг тест" : "други теста"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 pl-8">
                        <button type="button" onClick={() => moveQuestion(i, -1)} disabled={i === 0} className={iconButton} aria-label={`Премести въпрос ${i + 1} нагоре`}>
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(i, 1)}
                          disabled={i === selectedQuestions.length - 1}
                          className={iconButton}
                          aria-label={`Премести въпрос ${i + 1} надолу`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewIds((ids) => toggleIn(ids, q.id))}
                          className={iconButton}
                          aria-expanded={previewing}
                          aria-label={`${previewing ? "Скрий" : "Преглед на"} отговорите на въпрос ${i + 1}`}
                        >
                          {previewing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplacingId(replacing ? null : q.id)}
                          className={`${iconButton} ${replacing ? "bg-[#DD5B26]/15 text-[#B5461C]" : ""}`}
                          aria-pressed={replacing}
                          aria-label={`Замени въпрос ${i + 1}`}
                        >
                          <Replace className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/english-tests/questions/${q.id}`}
                          target="_blank"
                          className={iconButton}
                          aria-label={`Отвори въпрос ${i + 1} в редактора (нов раздел)`}
                        >
                          <PenSquare className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionIds((ids) => ids.filter((id) => id !== q.id))
                            if (replacing) setReplacingId(null)
                          }}
                          className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-extrabold text-[#C7503F] hover:bg-[#F27B6B]/15"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          Премахни
                          <span className="sr-only"> въпрос {i + 1}</span>
                        </button>
                      </div>
                      {previewing && (
                        <ul className="ml-8 flex flex-col gap-1 rounded-xl bg-[#F7FAFC] p-2" aria-label={`Отговори на въпрос ${i + 1}`}>
                          {q.options.map((o, oi) => (
                            <li
                              key={oi}
                              lang="en"
                              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold ${
                                o.isCorrect ? "bg-[#9ED9CA]/30 text-[#1F6B5C]" : "text-[#17324D]/70"
                              }`}
                            >
                              {o.isCorrect ? <Check className="h-4 w-4 shrink-0" aria-label="Верен отговор" /> : <span className="w-4 shrink-0" />}
                              {o.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ol>
              <p className="text-xs font-bold text-[#17324D]/55">
                Редакцията на въпрос в банката засяга всички тестове, в които се използва. Започнатите и завършените опити не се променят.
              </p>
            </div>
          </div>
        )}
      </Section>

      <Section title="Правила за провеждане">
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle label="Разбъркване на въпросите" checked={settings.shuffleQuestions} onChange={(v) => set("shuffleQuestions", v)} />
          <Toggle label="Разбъркване на отговорите" checked={settings.shuffleOptions} onChange={(v) => set("shuffleOptions", v)} />
          <Toggle label="Връщане към предишни въпроси" checked={settings.allowBack} onChange={(v) => set("allowBack", v)} />
          <Toggle label="Промяна на вече даден отговор" checked={settings.allowAnswerChange} onChange={(v) => set("allowAnswerChange", v)} />
          <Toggle label="Показване на резултата" checked={settings.showScore} onChange={(v) => set("showScore", v)} />
          <Toggle label="Показване на нивото" checked={settings.showLevel} onChange={(v) => set("showLevel", v)} />
          <Toggle
            label="Показване на верните отговори след края"
            hint="Ако е изключено, ученикът вижда само обобщение."
            checked={settings.showCorrectAnswers}
            onChange={(v) => set("showCorrectAnswers", v)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Максимален брой опити (0 = без ограничение)" htmlFor="t-attempts">
            <input
              id="t-attempts"
              type="number"
              min={0}
              max={50}
              value={settings.maxAttempts}
              onChange={(e) => set("maxAttempts", Math.max(0, Number(e.target.value) || 0))}
              className={inputClass}
            />
          </Field>
          <Field label="Изчакване между опитите (часове)" htmlFor="t-cooldown">
            <input
              id="t-cooldown"
              type="number"
              min={0}
              max={8760}
              value={settings.cooldownHours}
              onChange={(e) => set("cooldownHours", Math.max(0, Number(e.target.value) || 0))}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-full bg-[#17324D] px-5 py-3 text-white shadow-lg">
        <span className="text-sm font-extrabold">
          {finalCount} въпроса · {LABELS.testType[testType]}
          {dirty && <span className="ml-2 text-[#F9C784]">· незапазени промени</span>}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="rounded-full px-5 py-3 font-extrabold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
          >
            Отказ
          </button>
          <button type="submit" disabled={pending || replacingId !== null} className={primaryButton}>
            {pending ? "Запазване…" : test ? "Запази промените" : "Създай тест"}
          </button>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </form>
  )
}
