import Link from "next/link"
import { requireStudent } from "@/lib/english-tests/auth"
import { getAvailableTests, getStudentAttempts } from "@/lib/english-tests/student-data"
import { TestCard } from "@/components/testove/test-card"
import { Panel, formatDate, primaryButton } from "@/components/testove/ui"

export default async function DashboardHome() {
  const student = await requireStudent("/testove/dashboard")
  const [tests, attempts] = await Promise.all([getAvailableTests(student.id), getStudentAttempts(student.id)])
  const completed = attempts.filter((a) => a.status === "submitted" || a.status === "expired")
  const latest = completed[0]
  const startable = tests.find((t) => t.eligibility.activeAttemptId) ?? tests.find((t) => t.eligibility.canStart)

  return (
    <>
      <header className="flex flex-col gap-4 rounded-3xl bg-et-navy p-6 text-paper sm:p-8">
        <h1 className="font-display text-3xl font-extrabold text-balance sm:text-4xl">Здравей, {student.firstName}!</h1>
        <p className="max-w-xl leading-relaxed text-pretty text-paper/80">
          Тук са твоите тестове по английски и резултатите от тях.
        </p>
        {startable ? (
          <Link
            href={
              startable.eligibility.activeAttemptId
                ? `/testove/${startable.id}?attempt=${startable.eligibility.activeAttemptId}`
                : `/testove/${startable.id}`
            }
            className="inline-flex w-fit items-center rounded-full bg-et-mint px-7 py-3.5 font-extrabold text-et-navy transition hover:-translate-y-0.5"
          >
            {startable.eligibility.activeAttemptId ? "Продължи теста" : "Започни тест"}
          </Link>
        ) : null}
      </header>

      <Panel>
        <h2 className="sr-only">Обобщение</h2>
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Завършени тестове" value={String(completed.length)} />
          <Stat
            label="Последен резултат"
            value={latest?.showScore && latest.percentage !== null ? `${Math.round(latest.percentage)}%` : "—"}
          />
          <Stat
            label="Ориентировъчно ниво"
            value={latest?.showLevel ? (latest.estimatedLevel ?? (latest.conclusive === false ? "Неуточнено" : "—")) : "—"}
          />
          <Stat label="Последен тест" value={latest ? formatDate(latest.submittedAt ?? latest.startedAt) : "—"} />
        </dl>
      </Panel>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold">Налични тестове</h2>
          <Link href="/testove/dashboard/testove" className="text-sm font-extrabold underline underline-offset-4">
            Всички
          </Link>
        </div>
        {tests.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tests.slice(0, 4).map((t) => (
              <TestCard key={t.id} test={t} />
            ))}
          </div>
        ) : (
          <Panel>
            <p className="font-bold text-et-navy/70">В момента няма публикувани тестове.</p>
          </Panel>
        )}
      </section>

      {latest ? (
        <Link href={`/testove/rezultati/${latest.id}`} className={`${primaryButton} w-fit`}>
          Виж последния резултат
        </Link>
      ) : null}
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm font-bold text-et-navy/60">{label}</dt>
      <dd className="font-display text-2xl font-extrabold">{value}</dd>
    </div>
  )
}
