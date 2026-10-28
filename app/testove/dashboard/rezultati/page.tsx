import Link from "next/link"
import { requireStudent } from "@/lib/english-tests/auth"
import { getStudentAttempts } from "@/lib/english-tests/student-data"
import { Panel, STATUS_LABELS, formatDate } from "@/components/testove/ui"

export default async function MyResultsPage() {
  const student = await requireStudent("/testove/dashboard/rezultati")
  const done = (await getStudentAttempts(student.id)).filter((a) => a.status === "submitted" || a.status === "expired")
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Моите резултати</h1>
      {done.length === 0 ? (
        <Panel>
          <p className="font-bold text-et-navy/70">Още нямаш завършени тестове.</p>
        </Panel>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {done.map((a) => (
            <li key={a.id}>
              <Link
                href={`/testove/rezultati/${a.id}`}
                className="flex h-full flex-col gap-3 rounded-3xl border border-et-navy/10 bg-paper p-6 shadow-sm transition hover:border-et-navy/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-extrabold text-balance">{a.testTitle}</h2>
                  <span className="shrink-0 rounded-full bg-et-navy/5 px-3 py-1 text-xs font-extrabold">
                    Опит {a.attemptNumber}
                  </span>
                </div>
                <p className="text-sm font-bold text-et-navy/60">
                  {formatDate(a.submittedAt)} · {STATUS_LABELS[a.status]}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 font-extrabold">
                  {a.showScore && a.percentage !== null ? (
                    <span>
                      {a.correct ?? 0} / {a.total} верни · {Math.round(a.percentage)}%
                    </span>
                  ) : (
                    <span className="text-et-navy/60">Резултатът се преглежда от преподавател</span>
                  )}
                  {a.showLevel && a.estimatedLevel ? <span>Ниво: {a.estimatedLevel}</span> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
