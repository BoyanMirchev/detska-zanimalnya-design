"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { saveTest } from "@/app/actions/english-tests/admin"
import type { AdminCategory, AdminLevel, AdminTestDetail, PickerQuestion } from "@/lib/english-tests/admin-data"
import {
  DEFAULT_TEST_SETTINGS,
  DIFFICULTIES,
  EMPTY_SELECTION_CONFIG,
  LABELS,
  type Difficulty,
  type SelectionConfig,
  type SelectionMethod,
  type TestSettings,
  type TestType,
} from "@/lib/english-tests/types"
import { Field, FormError, Toast, inputClass, primaryButton } from "@/components/admin/ui"

const toLocalInput = (iso: string | null) => {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
  categories,
  questions,
}: {
  test: AdminTestDetail | null
  levels: AdminLevel[]
  categories: AdminCategory[]
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

  const set = <K extends keyof TestSettings>(key: K, value: TestSettings[K]) => setSettings((s) => ({ ...s, [key]: value }))

  const effectiveLevelIds = testType === "level" && levelId ? [levelId] : config.levelIds
  const useAllocations = method === "random" && testType === "placement" && config.allocations.length > 0
  const allocationTotal = config.allocations.reduce((sum, a) => sum + a.count, 0)

  const pool = useMemo(
    () =>
      questions.filter(
        (q) =>
          (effectiveLevelIds.length === 0 || effectiveLevelIds.includes(q.levelId)) &&
          (config.categoryIds.length === 0 || config.categoryIds.includes(q.categoryId)) &&
          (config.difficulties.length === 0 || config.difficulties.includes(q.difficulty)),
      ),
    [questions, effectiveLevelIds, config.categoryIds, config.difficulties],
  )
  const poolByLevel = useMemo(() => {
    const map = new Map<number, number>()
    for (const q of pool) map.set(q.levelId, (map.get(q.levelId) ?? 0) + 1)
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
  const selectedPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0)
  const finalCount = method === "manual" ? questionIds.length : useAllocations ? allocationTotal : questionCount
  const poolShortfall = method === "random" && !useAllocations && pool.length < questionCount

  function setAllocation(id: number, count: number) {
    setConfig((c) => {
      const others = c.allocations.filter((a) => a.levelId !== id)
      return { ...c, allocations: count > 0 ? [...others, { levelId: id, count }] : others }
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
        questionCount: useAllocations ? allocationTotal : questionCount,
        selectionMethod: method,
        selectionConfig: testType === "level" ? { ...config, levelIds: [], allocations: [] } : useAllocations ? config : { ...config, allocations: [] },
        questionIds,
        settings,
        availableFrom: form.get("availableFrom") ? new Date(String(form.get("availableFrom"))).toISOString() : "",
        availableUntil: form.get("availableUntil") ? new Date(String(form.get("availableUntil"))).toISOString() : "",
      })
      if (!res.ok) {
        setErrors(res.errors ?? {})
        setError(res.error ?? "Моля, коригирайте маркираните полета.")
        return
      }
      setToast(res.message ?? "Запазено.")
      if (!test && res.data) router.replace(`/admin/english-tests/${res.data.id}/edit`)
      else router.refresh()
    })
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <FormError message={error} />
      {test && test.attemptCount > 0 && (
        <p className="rounded-2xl bg-[#9ED9CA]/25 px-4 py-3 text-sm font-bold text-[#1F6B5C]">
          Тестът има {test.attemptCount} опита. Промените важат само за нови опити — завършените резултати остават непроменени.
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

      <Section title="Въпроси" description="Изберете конкретни въпроси или оставете системата да подбере случайни от банката по критерии.">
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
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-extrabold text-[#17324D]">Категории (празно = всички)</legend>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <Chip key={c.id} active={config.categoryIds.includes(c.id)} onClick={() => setConfig((x) => ({ ...x, categoryIds: toggleIn(x.categoryIds, c.id) }))}>
                      {c.name}
                    </Chip>
                  ))}
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-extrabold text-[#17324D]">Трудност (празно = всички)</legend>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <Chip
                    key={d}
                    active={config.difficulties.includes(d)}
                    onClick={() => setConfig((c) => ({ ...c, difficulties: toggleIn<Difficulty>(c.difficulties, d) }))}
                  >
                    {LABELS.difficulty[d]}
                  </Chip>
                ))}
              </div>
            </fieldset>

            {testType === "placement" ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-extrabold text-[#17324D]">Брой въпроси по ниво</p>
                <p className="text-xs font-bold text-[#17324D]/55">
                  Задайте точен брой от всяко ниво (препоръчително за надеждно определяне на ниво), или оставете всички на 0 и посочете общ брой.
                </p>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {activeLevels
                    .filter((l) => config.levelIds.length === 0 || config.levelIds.includes(l.id))
                    .map((l) => {
                      const current = config.allocations.find((a) => a.levelId === l.id)?.count ?? 0
                      const available = poolByLevel.get(l.id) ?? 0
                      return (
                        <li key={l.id} className="flex items-center gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-2">
                          <label htmlFor={`alloc-${l.id}`} className="flex-1 font-extrabold text-[#17324D]">
                            {l.name}
                            <span className={`block text-xs ${current > available ? "text-[#C7503F]" : "text-[#17324D]/50"}`}>
                              налични: {available}
                            </span>
                          </label>
                          <input
                            id={`alloc-${l.id}`}
                            type="number"
                            min={0}
                            max={200}
                            value={current}
                            onChange={(e) => setAllocation(l.id, Math.max(0, Number(e.target.value) || 0))}
                            className={`${inputClass} w-20`}
                          />
                        </li>
                      )
                    })}
                </ul>
              </div>
            ) : null}

            {!useAllocations && (
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
            )}
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
            <div className="flex flex-col gap-2">
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
                {pickerRows.map((q) => (
                  <li key={q.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-white">
                      <input
                        type="checkbox"
                        checked={questionIds.includes(q.id)}
                        onChange={() => setQuestionIds((ids) => toggleIn(ids, q.id))}
                        className="mt-1 h-4 w-4 accent-[#DD5B26]"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span lang="en" className="line-clamp-2 text-sm font-bold text-[#17324D]">
                          {q.text}
                        </span>
                        <span className="text-xs font-bold text-[#17324D]/50">
                          {q.levelName} · {q.categoryName} · {LABELS.difficulty[q.difficulty]} · {q.points} т.
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-extrabold text-[#17324D]">
                Избрани: {questionIds.length} въпроса · {selectedPoints} точки
              </p>
              {errors.questionIds && (
                <p role="alert" className="text-sm font-bold text-[#C7503F]">
                  {errors.questionIds}
                </p>
              )}
              <ol className="flex max-h-96 flex-col gap-1 overflow-y-auto rounded-2xl border-2 border-dashed border-[#17324D]/10 p-2">
                {selectedQuestions.length === 0 && <li className="p-3 text-sm font-bold text-[#17324D]/55">Изберете въпроси от списъка.</li>}
                {selectedQuestions.map((q, i) => (
                  <li key={q.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                    <span className="w-6 text-xs font-extrabold text-[#17324D]/40">{i + 1}.</span>
                    <span lang="en" className="line-clamp-1 flex-1 text-sm font-bold text-[#17324D]">
                      {q.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuestionIds((ids) => ids.filter((id) => id !== q.id))}
                      className="rounded-full px-2 text-sm font-extrabold text-[#C7503F] hover:bg-[#F27B6B]/15"
                    >
                      Премахни
                      <span className="sr-only"> въпрос {i + 1}</span>
                    </button>
                  </li>
                ))}
              </ol>
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

      <Section title="Достъпност" description="По желание: ограничете периода, в който тестът може да бъде започнат.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Достъпен от" htmlFor="t-from" error={errors.availableFrom}>
            <input id="t-from" name="availableFrom" type="datetime-local" defaultValue={toLocalInput(test?.availableFrom ?? null)} className={inputClass} />
          </Field>
          <Field label="Достъпен до" htmlFor="t-until" error={errors.availableUntil}>
            <input id="t-until" name="availableUntil" type="datetime-local" defaultValue={toLocalInput(test?.availableUntil ?? null)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-full bg-[#17324D] px-5 py-3 text-white shadow-lg">
        <span className="text-sm font-extrabold">
          {finalCount} въпроса · {LABELS.testType[testType]}
        </span>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Запазване…" : test ? "Запази промените" : "Създай тест"}
        </button>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </form>
  )
}
