import Link from "next/link"
import { Clock, ListChecks } from "lucide-react"
import type { AvailableTest } from "@/lib/english-tests/student-data"
import { formatDate, primaryButton, secondaryButton } from "./ui"

export function TestCard({ test }: { test: AvailableTest }) {
  const { eligibility: el } = test
  const resuming = Boolean(el.activeAttemptId)
  const status = resuming
    ? "Започнат – продължи"
    : el.canStart
      ? "Наличен"
      : el.nextAvailableAt
        ? `Отново от ${formatDate(el.nextAvailableAt)}`
        : (el.reason ?? "Не е наличен")

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-et-navy/10 bg-paper p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-et-mint/40 px-3 py-1 text-xs font-extrabold text-et-navy">
          {test.testType === "placement" ? "Входящ тест" : `Ниво ${test.levelName ?? ""}`}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
            el.canStart || resuming ? "bg-et-navy/5 text-et-navy" : "bg-et-coral/15 text-berry"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl font-extrabold text-balance">{test.title}</h3>
        {test.description ? <p className="leading-relaxed text-pretty text-et-navy/70">{test.description}</p> : null}
      </div>
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-et-navy/70">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Въпроси</dt>
          <dd>{test.questionCount} въпроса</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Време</dt>
          <dd>{test.durationMinutes} мин.</dd>
        </div>
        <div>
          <dt className="sr-only">Опити</dt>
          <dd>
            Опити: {el.attemptsUsed}
            {el.attemptsAllowed ? ` от ${el.attemptsAllowed}` : ""}
          </dd>
        </div>
      </dl>
      <div className="mt-auto">
        {resuming ? (
          <Link href={`/testove/${test.id}?attempt=${el.activeAttemptId}`} className={primaryButton}>
            Продължи теста
          </Link>
        ) : el.canStart ? (
          <Link href={`/testove/${test.id}`} className={primaryButton}>
            Започни тест
          </Link>
        ) : (
          <Link href={`/testove/${test.id}`} className={secondaryButton}>
            Подробности
          </Link>
        )}
      </div>
    </article>
  )
}
