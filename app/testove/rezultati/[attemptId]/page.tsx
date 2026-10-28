import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, X } from "lucide-react"
import { requireStudent } from "@/lib/english-tests/auth"
import { isUuid } from "@/lib/english-tests/engine"
import { getStudentResult } from "@/lib/english-tests/student-data"
import { Panel, formatDate, primaryButton, secondaryButton } from "@/components/testove/ui"

export const metadata: Metadata = { title: "Резултат | Тестове по английски", robots: { index: false } }

export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params
  if (!isUuid(attemptId)) notFound()
  const student = await requireStudent(`/testove/rezultati/${attemptId}`)
  const r = await getStudentResult(student.id, attemptId)
  if (!r) notFound()

  const pct = r.percentage !== null ? Math.round(r.percentage) : null
  const placement = r.placement

  return (
    <main className="min-h-dvh bg-et-mist px-4 py-10 font-sans text-et-navy">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2 rounded-3xl bg-et-navy p-6 text-paper sm:p-8">
          <p className="text-sm font-extrabold text-et-mint">
            {r.status === "expired" ? "Времето изтече – тестът е предаден автоматично" : "Тестът е предаден"}
          </p>
          <h1 className="font-display text-3xl font-extrabold text-balance">
            {r.testType === "placement" ? "Поздравления! Ти завърши входящия тест!" : `Поздравления! Ти завърши „${r.testTitle}“!`}
          </h1>
          <p className="text-paper/75">
            {r.testTitle} · Опит {r.attemptNumber} · {formatDate(r.submittedAt)}
          </p>
        </header>

        {r.showScore && pct !== null ? (
          <Panel className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <p className="font-display text-2xl font-extrabold">
                  Резултат: {r.correct ?? 0} от {r.total} верни
                </p>
                <p className="font-display text-xl font-extrabold">Успеваемост: {pct}%</p>
              </div>
              <div
                className="h-4 overflow-hidden rounded-full bg-et-navy/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label="Успеваемост"
              >
                <div className="h-full rounded-full bg-et-mint" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Отговорени" value={`${r.answered} / ${r.total}`} />
              <Stat label="Верни" value={String(r.correct ?? 0)} />
              <Stat label="Грешни" value={String(r.incorrect)} />
              <Stat label="Без отговор" value={String(r.unanswered)} />
            </dl>
          </Panel>
        ) : (
          <Panel>
            <p className="font-bold leading-relaxed">Резултатът ще бъде показан, след като преподавателят го прегледа.</p>
          </Panel>
        )}

        {r.showLevel && placement ? (
          <Panel className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-extrabold">Ориентировъчно ниво</h2>
            {placement.conclusive && placement.levelName ? (
              <p className="rounded-2xl bg-et-mint/25 px-4 py-4 font-display text-3xl font-extrabold text-balance">
                Ти си на ниво {placement.levelName}
              </p>
            ) : (
              <p className="rounded-2xl bg-et-coral/15 px-4 py-3 font-extrabold text-berry">
                Необходимо е допълнително оценяване.
              </p>
            )}
            {placement.mode === "score_bands" ? (
              <ul className="flex flex-col gap-2">
                {placement.levels.map((l, i) => {
                  const next = placement.levels[i + 1]
                  const current = l.levelName === placement.levelName
                  return (
                    <li
                      key={l.levelId}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${
                        current ? "bg-et-mint/25" : "bg-et-mist"
                      }`}
                    >
                      <span className="font-extrabold">{l.levelName}</span>
                      <span>
                        {l.minPercent}–{next ? Math.max(next.minPercent - 1, 0) : 100}%{current ? " · твоето ниво" : ""}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : placement.levels.length ? (
              <ul className="flex flex-col gap-2">
                {placement.levels.map((l) => (
                  <li key={l.levelId} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-et-mist px-4 py-3 text-sm font-bold">
                    <span className="font-extrabold">{l.levelName}</span>
                    <span>
                      {l.percent !== null ? `${Math.round(l.percent)}%` : "—"} ({l.questions} въпр.)
                      {!l.enoughQuestions ? " · недостатъчно въпроси" : l.passed ? " · покрито" : " · не е покрито"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-sm leading-relaxed text-et-navy/70">
              Тестовете с избираем отговор дават предварителна препоръка за ниво. Те не са официално CEFR сертифициране.
            </p>
          </Panel>
        ) : null}

        {r.review ? (
          <Panel className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-extrabold">Преглед на отговорите</h2>
            <ol className="flex flex-col gap-4">
              {r.review.map((q) => (
                <li key={q.order} className="flex flex-col gap-2 rounded-2xl border border-et-navy/10 p-4">
                  <p className="flex items-start gap-2 font-extrabold">
                    {q.isCorrect ? (
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf" aria-label="Верен" />
                    ) : (
                      <X className="mt-0.5 h-5 w-5 shrink-0 text-berry" aria-label="Грешен" />
                    )}
                    <span className="whitespace-pre-line">
                      {q.order}. {q.text}
                    </span>
                  </p>
                  <ul className="flex flex-col gap-1 pl-7 text-sm font-bold">
                    {q.options.map((o) => (
                      <li key={o.id} className={o.correct ? "text-leaf" : o.selected ? "text-berry" : "text-et-navy/60"}>
                        {o.text}
                        {o.selected ? " · твоят отговор" : ""}
                        {o.correct ? " · верен" : ""}
                      </li>
                    ))}
                  </ul>
                  {q.explanation ? <p className="pl-7 text-sm leading-relaxed text-et-navy/70">{q.explanation}</p> : null}
                </li>
              ))}
            </ol>
          </Panel>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link href="/testove/dashboard" className={primaryButton}>
            Към началото
          </Link>
          <Link href="/testove/dashboard/rezultati" className={secondaryButton}>
            Моите резултати
          </Link>
          {r.canRetake ? (
            <Link href={`/testove/${r.testId}`} className={secondaryButton}>
              Опитай отново
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-et-mist p-4">
      <dt className="text-xs font-bold text-et-navy/60">{label}</dt>
      <dd className="font-display text-xl font-extrabold">{value}</dd>
    </div>
  )
}
