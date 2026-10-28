import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, Minus, X } from "lucide-react"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { getAdminResult } from "@/lib/english-tests/admin-data"
import { INCONCLUSIVE_MESSAGE, LABELS } from "@/lib/english-tests/types"
import { Card, EtShell, Pill, formatDateTime, formatPercent } from "@/components/admin/english-tests/et-shell"
import { ResultAdminActions } from "@/components/admin/english-tests/result-admin-actions"

export const dynamic = "force-dynamic"

export default async function AdminResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  await requireAdminPage()
  const { attemptId } = await params
  const r = await getAdminResult(attemptId)
  if (!r) notFound()

  const durationMin = r.submittedAt ? Math.max(1, Math.round((Date.parse(r.submittedAt) - Date.parse(r.startedAt)) / 60000)) : null
  const stats = [
    { label: "Резултат", value: formatPercent(r.percentage) },
    { label: "Верни", value: r.correct ?? "—" },
    { label: "Грешни", value: r.incorrect ?? "—" },
    { label: "Без отговор", value: r.unanswered ?? "—" },
    { label: "Време", value: durationMin ? `${durationMin} мин` : "—" },
  ]

  return (
    <EtShell title={r.student.name} subtitle={`@${r.student.username} · ${r.testTitle} · опит ${r.attemptNumber}`}>
      <Link href="/admin/english-tests/results" className="self-start text-sm font-extrabold text-[#DD5B26] hover:underline">
        ← Към всички резултати
      </Link>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={r.status === "expired" ? "orange" : "green"}>{LABELS.attemptStatus[r.status as keyof typeof LABELS.attemptStatus]}</Pill>
              {r.testType === "placement" &&
                (r.level ? <Pill tone="blue">Определено ниво: {r.level}</Pill> : <Pill tone="orange">{INCONCLUSIVE_MESSAGE}</Pill>)}
              {r.rulesVersion && <Pill>Правила v{r.rulesVersion}</Pill>}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-[#F7FAFC] px-4 py-3">
                  <dt className="text-xs font-extrabold text-[#17324D]/55">{s.label}</dt>
                  <dd className="text-xl font-extrabold text-[#17324D]">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs font-bold text-[#17324D]/50">
              Започнат {formatDateTime(r.startedAt)} · предаден {formatDateTime(r.submittedAt)}
            </p>
          </Card>

          {r.placement && r.placement.levels.length > 0 && (
            <Card>
              <h2 className="text-lg font-extrabold text-[#17324D]">Резултат по нива</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {r.placement.levels.map((l) => (
                  <li key={l.levelId} className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-3">
                    <span className="w-24 font-extrabold text-[#17324D]">{l.levelName}</span>
                    <span className="h-2.5 min-w-24 flex-1 overflow-hidden rounded-full bg-[#17324D]/8" aria-hidden>
                      <span className={`block h-full rounded-full ${l.passed ? "bg-[#1F6B5C]" : "bg-[#DD5B26]"}`} style={{ width: `${l.percent ?? 0}%` }} />
                    </span>
                    <span className="text-sm font-extrabold text-[#17324D]">
                      {formatPercent(l.percent)}{" "}
                      <span className="text-[#17324D]/50">
                        {r.placement?.mode === "score_bands" ? `/ нивото започва от ${l.minPercent}%` : `/ праг ${l.minPercent}%`}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#17324D]/55">
                      {l.questions} въпроса{!l.enoughQuestions && " (недостатъчно)"}
                    </span>
                  </li>
                ))}
              </ul>
              {r.placement.reason && <p className="mt-3 text-sm font-bold text-[#17324D]/70">{r.placement.reason}</p>}
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-extrabold text-[#17324D]">Отговори по въпроси</h2>
            <ol className="mt-3 flex flex-col gap-3">
              {r.questions.map((q, i) => (
                <li key={q.id} className="rounded-2xl border border-[#17324D]/8 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        !q.answered ? "bg-[#17324D]/8 text-[#17324D]/60" : q.isCorrect ? "bg-[#9ED9CA]/40 text-[#1F6B5C]" : "bg-[#F27B6B]/20 text-[#C7503F]"
                      }`}
                    >
                      {!q.answered ? <Minus className="h-4 w-4" /> : q.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span className="sr-only">{!q.answered ? "Без отговор" : q.isCorrect ? "Верен" : "Грешен"}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p lang="en" className="font-extrabold text-[#17324D]">
                        {i + 1}. {q.text}
                      </p>
                      <p className="text-xs font-bold text-[#17324D]/50">
                        {q.levelName} · {LABELS.questionType[q.type]}
                      </p>
                      <ul className="mt-2 flex flex-col gap-1">
                        {q.options.map((o) => (
                          <li
                            key={o.id}
                            lang="en"
                            className={`flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-sm font-bold ${
                              o.correct ? "bg-[#9ED9CA]/25 text-[#1F6B5C]" : o.selected ? "bg-[#F27B6B]/12 text-[#C7503F]" : "text-[#17324D]/70"
                            }`}
                          >
                            <span>{o.text}</span>
                            <span lang="bg" className="text-xs font-extrabold">
                              {o.selected && "Избран"}
                              {o.selected && o.correct && " · "}
                              {o.correct && "Верен"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <ResultAdminActions attemptId={r.id} studentId={r.student.id} testId={r.testId} notes={r.notes} />
          <Card>
            <h2 className="font-extrabold text-[#17324D]">История на ученика</h2>
            <ul className="mt-3 flex flex-col divide-y divide-[#17324D]/8">
              {r.history.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/admin/english-tests/results/${h.id}`}
                    aria-current={h.id === r.id ? "page" : undefined}
                    className={`flex items-center justify-between gap-2 py-2 text-sm font-bold ${h.id === r.id ? "text-[#DD5B26]" : "text-[#17324D]"}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{h.testTitle}</span>
                      <span className="text-xs text-[#17324D]/50">{formatDateTime(h.submittedAt)}</span>
                    </span>
                    <span className="shrink-0 font-extrabold">
                      {formatPercent(h.percentage)}
                      {h.level && ` · ${h.level}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </EtShell>
  )
}
