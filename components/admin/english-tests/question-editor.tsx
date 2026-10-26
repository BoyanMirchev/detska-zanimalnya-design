"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { saveQuestion } from "@/app/actions/english-tests/admin"
import type { AdminCategory, AdminLevel, AdminQuestionDetail } from "@/lib/english-tests/admin-data"
import { LABELS, QUESTION_STATUSES, QUESTION_TYPES, type QuestionType } from "@/lib/english-tests/types"
import { Field, FormError, Toast, inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"

type Option = { key: number; text: string; isCorrect: boolean }

const TRUE_FALSE: Option[] = [
  { key: 1, text: "True", isCorrect: true },
  { key: 2, text: "False", isCorrect: false },
]

let keySeed = 100
const nextKey = () => ++keySeed

export function QuestionEditor({
  question,
  levels,
  categories,
}: {
  question: AdminQuestionDetail | null
  levels: AdminLevel[]
  categories: AdminCategory[]
}) {
  const router = useRouter()
  const [type, setType] = useState<QuestionType>(question?.type ?? "single")
  const [options, setOptions] = useState<Option[]>(
    question?.options.map((o) => ({ key: nextKey(), ...o })) ?? [
      { key: nextKey(), text: "", isCorrect: true },
      { key: nextKey(), text: "", isCorrect: false },
      { key: nextKey(), text: "", isCorrect: false },
    ],
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const usableLevels = levels.filter((l) => !l.archived || l.id === question?.levelId)
  const usableCategories = categories.filter((c) => c.isActive || c.id === question?.categoryId)

  function changeType(next: QuestionType) {
    setType(next)
    if (next === "true_false") setOptions(TRUE_FALSE.map((o) => ({ ...o, key: nextKey() })))
    else if (type === "true_false") {
      setOptions([
        { key: nextKey(), text: "", isCorrect: true },
        { key: nextKey(), text: "", isCorrect: false },
        { key: nextKey(), text: "", isCorrect: false },
      ])
    } else if (next === "single") {
      const firstCorrect = options.findIndex((o) => o.isCorrect)
      setOptions(options.map((o, i) => ({ ...o, isCorrect: i === Math.max(firstCorrect, 0) })))
    }
  }

  function toggleCorrect(key: number) {
    setOptions((prev) =>
      type === "multiple"
        ? prev.map((o) => (o.key === key ? { ...o, isCorrect: !o.isCorrect } : o))
        : prev.map((o) => ({ ...o, isCorrect: o.key === key })),
    )
  }

  function submit(form: FormData) {
    startTransition(async () => {
      setErrors({})
      setError(null)
      const res = await saveQuestion(question?.id ?? null, {
        type,
        text: form.get("text"),
        levelId: form.get("levelId"),
        categoryId: form.get("categoryId"),
        difficulty: form.get("difficulty"),
        points: form.get("points"),
        explanation: form.get("explanation"),
        status: form.get("status"),
        options: options.map(({ text, isCorrect }) => ({ text, isCorrect })),
      })
      if (!res.ok) {
        setErrors(res.errors ?? {})
        setError(res.error ?? (res.errors ? "Моля, коригирайте маркираните полета." : "Възникна грешка."))
        return
      }
      setToast(res.message ?? "Въпросът е запазен.")
      if (!question && res.data && typeof res.data === "object" && "id" in res.data) {
        router.replace(`/admin/english-tests/questions/${(res.data as { id: number }).id}`)
      } else router.refresh()
    })
  }

  const usedInAttempts = (question?.attemptCount ?? 0) > 0

  return (
    <form action={submit} className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <FormError message={error} />
        {usedInAttempts && (
          <p className="rounded-2xl bg-[#9ED9CA]/25 px-4 py-3 text-sm font-bold text-[#1F6B5C]">
            Този въпрос вече е използван в {question?.attemptCount} опита. Промените няма да засегнат старите резултати — всеки опит
            пази копие на въпроса такъв, какъвто е бил.
          </p>
        )}
        {question && question.tests.length > 1 && (
          <p role="note" className="rounded-2xl bg-[#DD5B26]/10 px-4 py-3 text-sm font-bold text-[#B5461C]">
            Внимание: този въпрос се използва в {question.tests.length} теста ({question.tests.map((t) => t.title).join(", ")}). Промяната ще
            важи за новите опити във всички тях. Ако искате промяна само за един тест, използвайте „Дублирай“ и заменете въпроса в този тест.
          </p>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-extrabold text-[#17324D]">Тип въпрос</legend>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map((t) => (
              <label
                key={t}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  type === t ? "bg-[#17324D] text-white" : "bg-[#17324D]/5 text-[#17324D] hover:bg-[#17324D]/10"
                }`}
              >
                <input type="radio" name="typeChoice" value={t} checked={type === t} onChange={() => changeType(t)} className="sr-only" />
                {LABELS.questionType[t]}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Текст на въпроса" htmlFor="q-text" error={errors.text} required>
          <textarea
            id="q-text"
            name="text"
            lang="en"
            rows={3}
            maxLength={2000}
            defaultValue={question?.text}
            aria-invalid={!!errors.text}
            className={inputClass}
            required
          />
        </Field>

        <fieldset className="flex flex-col gap-2" aria-describedby={errors.options ? "q-options-error" : undefined}>
          <legend className="mb-1 text-sm font-extrabold text-[#17324D]">
            Отговори{" "}
            <span className="font-bold text-[#17324D]/55">
              — {type === "multiple" ? "маркирайте всички верни" : "маркирайте верния"}
            </span>
          </legend>
          <ul className="flex flex-col gap-2">
            {options.map((o, i) => (
              <li key={o.key} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${o.isCorrect ? "bg-[#9ED9CA]/25" : "bg-[#F7FAFC]"}`}>
                <label className="flex shrink-0 items-center gap-2 text-xs font-extrabold text-[#17324D]/70">
                  <input
                    type={type === "multiple" ? "checkbox" : "radio"}
                    name="correct"
                    checked={o.isCorrect}
                    onChange={() => toggleCorrect(o.key)}
                    className="h-4 w-4 accent-[#1F6B5C]"
                  />
                  <span className="sr-only sm:not-sr-only">Верен</span>
                </label>
                <input
                  aria-label={`Отговор ${i + 1}`}
                  lang="en"
                  value={o.text}
                  maxLength={500}
                  readOnly={type === "true_false"}
                  onChange={(e) => setOptions((prev) => prev.map((x) => (x.key === o.key ? { ...x, text: e.target.value } : x)))}
                  className={`${inputClass} flex-1`}
                />
                {type !== "true_false" && (
                  <button
                    type="button"
                    disabled={options.length <= 2}
                    onClick={() => setOptions((prev) => prev.filter((x) => x.key !== o.key))}
                    className="rounded-full p-2 text-[#C7503F] hover:bg-[#F27B6B]/15 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Премахни отговор {i + 1}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          {type !== "true_false" && options.length < 8 && (
            <button
              type="button"
              className={`${secondaryButton} self-start`}
              onClick={() => setOptions((prev) => [...prev, { key: nextKey(), text: "", isCorrect: false }])}
            >
              <Plus className="h-4 w-4" /> Добави отговор
            </button>
          )}
          {errors.options && (
            <p id="q-options-error" role="alert" className="text-sm font-bold text-[#C7503F]">
              {errors.options}
            </p>
          )}
          {type === "multiple" && (
            <p className="text-xs font-bold text-[#17324D]/55">
              Оценяване „всичко или нищо“: точките се дават само при избрани всички верни и нито един грешен отговор.
            </p>
          )}
        </fieldset>

        <Field label="Обяснение (по желание)" htmlFor="q-expl" error={errors.explanation}>
          <textarea id="q-expl" name="explanation" rows={2} maxLength={2000} defaultValue={question?.explanation} className={inputClass} />
        </Field>
      </div>

      <aside className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6 lg:self-start">
        <Field label="Ниво" htmlFor="q-level" error={errors.levelId} required>
          <select id="q-level" name="levelId" defaultValue={question?.levelId ?? ""} className={inputClass} required>
            <option value="" disabled>
              Изберете
            </option>
            {usableLevels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Категория" htmlFor="q-cat" error={errors.categoryId} required>
          <select id="q-cat" name="categoryId" defaultValue={question?.categoryId ?? ""} className={inputClass} required>
            <option value="" disabled>
              Изберете
            </option>
            {usableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <input type="hidden" name="difficulty" value={question?.difficulty ?? "medium"} />
        <Field label="Точки" htmlFor="q-points" error={errors.points}>
          <input id="q-points" name="points" type="number" min={1} max={100} defaultValue={question?.points ?? 1} className={inputClass} />
        </Field>
        <Field label="Статус" htmlFor="q-status" error={errors.status}>
          <select id="q-status" name="status" defaultValue={question?.status ?? "active"} className={inputClass}>
            {QUESTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LABELS.questionStatus[s]}
              </option>
            ))}
          </select>
        </Field>

        {question && question.tests.length > 0 && (
          <div className="rounded-2xl bg-[#F7FAFC] p-3 text-sm font-bold text-[#17324D]">
            <p className="mb-1 font-extrabold">Използва се в:</p>
            <ul className="flex flex-col gap-1">
              {question.tests.map((t) => (
                <li key={t.id}>
                  <Link href={`/admin/english-tests/${t.id}/edit`} className="text-[#DD5B26] hover:underline">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/english-tests/questions" className={secondaryButton}>
            Назад
          </Link>
          <button type="submit" className={`${primaryButton} flex-1`} disabled={pending}>
            {pending ? "Запазване…" : "Запази въпроса"}
          </button>
        </div>
      </aside>
      <Toast message={toast} onDone={() => setToast(null)} />
    </form>
  )
}
