import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { requireStudent } from "@/lib/english-tests/auth"
import { getAttemptForStudent, isUuid } from "@/lib/english-tests/engine"
import { getTestIntro } from "@/lib/english-tests/student-data"
import { TestRunner } from "@/components/testove/test-runner"
import { StartTestButton } from "@/components/testove/start-test-button"
import { Alert, formatDate, primaryButton } from "@/components/testove/ui"

export const metadata: Metadata = { title: "Тест | Тестове по английски", robots: { index: false } }

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>
  searchParams: Promise<{ attempt?: string }>
}) {
  const { testId: raw } = await params
  const { attempt: attemptId } = await searchParams
  const testId = Number(raw)
  if (!Number.isInteger(testId) || testId <= 0) notFound()

  const path = attemptId ? `/testove/${testId}?attempt=${attemptId}` : `/testove/${testId}`
  const student = await requireStudent(path)

  if (attemptId) {
    if (!isUuid(attemptId)) notFound()
    const attempt = await getAttemptForStudent(student.id, attemptId)
    if (!attempt || attempt.testId !== testId) notFound()
    if (attempt.status !== "in_progress") redirect(`/testove/rezultati/${attempt.id}`)
    return <TestRunner attempt={attempt} />
  }

  const intro = await getTestIntro(student.id, testId)
  if (!intro) notFound()
  const el = intro.eligibility

  return (
    <main className="min-h-dvh bg-et-mist px-4 py-10 font-sans text-et-navy">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link href="/testove/dashboard/testove" className="text-sm font-extrabold underline underline-offset-4">
          Обратно към тестовете
        </Link>
        <article className="flex flex-col gap-6 rounded-3xl border border-et-navy/10 bg-paper p-6 shadow-sm sm:p-8">
          <header className="flex flex-col gap-3">
            <span className="w-fit rounded-full bg-et-mint/40 px-3 py-1 text-xs font-extrabold">
              {intro.testType === "placement" ? "Входящ тест" : `Ниво ${intro.levelName ?? ""}`}
            </span>
            <h1 className="font-display text-3xl font-extrabold text-balance">{intro.title}</h1>
            {intro.description ? <p className="leading-relaxed text-pretty text-et-navy/70">{intro.description}</p> : null}
          </header>

          <dl className="grid grid-cols-3 gap-3">
            <Fact label="Въпроси" value={String(intro.questionCount)} />
            <Fact label="Време" value={`${intro.durationMinutes} мин.`} />
            <Fact
              label="Опити"
              value={el.attemptsAllowed ? `${Math.max(0, el.attemptsAllowed - el.attemptsUsed)} от ${el.attemptsAllowed}` : "Без ограничение"}
            />
          </dl>

          <section className="flex flex-col gap-2">
            <h2 className="font-display text-lg font-extrabold">Инструкции</h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 leading-relaxed text-et-navy/80">
              <li>Времето започва да тече, когато натиснеш „Започни теста“, и не спира, ако затвориш страницата.</li>
              <li>Отговорите се запазват автоматично след всеки избор.</li>
              <li>
                {intro.instructions.allowBack
                  ? "Можеш да се връщаш към предишни въпроси и да прескачаш."
                  : "Не можеш да се връщаш към предишни въпроси."}
              </li>
              <li>
                {intro.instructions.allowAnswerChange
                  ? "Можеш да променяш отговорите си до предаването."
                  : "Веднъж избран, отговорът не може да се промени."}
              </li>
              <li>Можеш да оставиш въпрос без отговор. Когато времето изтече, тестът се предава автоматично.</li>
            </ul>
          </section>

          {el.activeAttemptId ? (
            <Link href={`/testove/${testId}?attempt=${el.activeAttemptId}`} className={`${primaryButton} w-full sm:w-fit`}>
              Продължи започнатия тест
            </Link>
          ) : !intro.open ? (
            <Alert tone="info">Тестът в момента не е отворен.</Alert>
          ) : el.canStart ? (
            <StartTestButton testId={testId} />
          ) : (
            <Alert tone="info">
              {el.nextAvailableAt
                ? `Ще можеш да опиташ отново от ${formatDate(el.nextAvailableAt)}.`
                : (el.reason ?? "Нямаш право на нов опит за този тест.")}
            </Alert>
          )}
        </article>
      </div>
    </main>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-et-mist p-4">
      <dt className="text-xs font-bold text-et-navy/60">{label}</dt>
      <dd className="font-display text-lg font-extrabold">{value}</dd>
    </div>
  )
}
