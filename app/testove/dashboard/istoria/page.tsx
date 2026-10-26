import Link from "next/link"
import { requireStudent } from "@/lib/english-tests/auth"
import { getStudentAttempts } from "@/lib/english-tests/student-data"
import { Panel, STATUS_LABELS, formatDate } from "@/components/testove/ui"

export default async function HistoryPage() {
  const student = await requireStudent("/testove/dashboard/istoria")
  const attempts = await getStudentAttempts(student.id)
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">История на тестовете</h1>
      <Panel className="overflow-x-auto p-0">
        {attempts.length === 0 ? (
          <p className="p-6 font-bold text-et-navy/70">Още нямаш започнати тестове.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-et-navy/10 text-et-navy/60">
              <tr>
                {["Тест", "Дата", "Верни", "Общо", "%", "Точки", "Ниво", "Статус", ""].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-extrabold">
                    {h || <span className="sr-only">Действие</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => {
                const finished = a.status === "submitted" || a.status === "expired"
                const show = finished && a.showScore
                return (
                  <tr key={a.id} className="border-b border-et-navy/5 font-bold last:border-0">
                    <td className="px-4 py-3 font-extrabold">{a.testTitle}</td>
                    <td className="px-4 py-3">{formatDate(a.submittedAt ?? a.startedAt)}</td>
                    <td className="px-4 py-3">{show ? a.correct : "—"}</td>
                    <td className="px-4 py-3">{a.total}</td>
                    <td className="px-4 py-3">{show && a.percentage !== null ? `${Math.round(a.percentage)}%` : "—"}</td>
                    <td className="px-4 py-3">{show ? `${a.score}/${a.maxScore}` : "—"}</td>
                    <td className="px-4 py-3">{finished && a.showLevel ? (a.estimatedLevel ?? "—") : "—"}</td>
                    <td className="px-4 py-3">{STATUS_LABELS[a.status]}</td>
                    <td className="px-4 py-3">
                      {finished ? (
                        <Link href={`/testove/rezultati/${a.id}`} className="font-extrabold underline underline-offset-4">
                          Отвори
                        </Link>
                      ) : a.status === "in_progress" ? (
                        <Link href={`/testove/${a.testId}?attempt=${a.id}`} className="font-extrabold underline underline-offset-4">
                          Продължи
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  )
}
