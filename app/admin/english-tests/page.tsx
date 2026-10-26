import Link from "next/link"
import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { getOverviewStats } from "@/lib/english-tests/admin-data"
import { Card, EtShell, EmptyState, Pill, formatDateTime, formatPercent } from "@/components/admin/english-tests/et-shell"
import { INCONCLUSIVE_MESSAGE } from "@/lib/english-tests/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Тестове по английски — админ", robots: { index: false } }

export default async function EnglishTestsOverviewPage() {
  await requireAdminPage()
  const stats = await getOverviewStats()
  const maxDistribution = Math.max(1, ...stats.distribution.map((d) => d.count))

  const cards = [
    { label: "Въпроси в банката", value: stats.questions, hint: `${stats.activeQuestions} активни` },
    { label: "Публикувани тестове", value: stats.publishedTests },
    { label: "Регистрирани ученици", value: stats.students },
    { label: "Завършени тестове", value: stats.completed, hint: stats.inProgress ? `${stats.inProgress} в процес` : undefined },
    { label: "Среден резултат", value: formatPercent(stats.avgPercent) },
  ]

  return (
    <EtShell
      title="Тестове по английски"
      subtitle="Банка с въпроси, тестове и резултати от входящото оценяване."
      actions={
        <Link href="/admin/english-tests/create" className="inline-flex items-center rounded-full bg-[#DD5B26] px-6 py-3 font-extrabold text-white shadow-sm transition hover:-translate-y-0.5">
          Нов тест
        </Link>
      }
    >
      {stats.pendingRecovery > 0 && (
        <Link
          href="/admin/english-tests/students#recovery"
          className="rounded-3xl bg-[#DD5B26]/10 px-5 py-4 font-extrabold text-[#B5461A] transition hover:bg-[#DD5B26]/15"
        >
          Заявки за възстановяване на достъп: {stats.pendingRecovery}. Прегледайте ги в раздел „Ученици“.
        </Link>
      )}

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((c) => (
          <li key={c.label} className="flex flex-col gap-1 rounded-3xl bg-white p-5 shadow-sm">
            <span className="text-sm font-extrabold text-[#17324D]/55">{c.label}</span>
            <span className="text-3xl font-extrabold text-[#17324D]">{c.value}</span>
            {c.hint && <span className="text-xs font-bold text-[#17324D]/50">{c.hint}</span>}
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-extrabold text-[#17324D]">Разпределение по ниво (входящи тестове)</h2>
          {stats.distribution.length === 0 ? (
            <p className="mt-3 font-bold text-[#17324D]/55">Все още няма завършени входящи тестове.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {stats.distribution.map((d) => (
                <li key={d.level ?? "none"} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm font-extrabold text-[#17324D]">{d.level ?? "Неустановено"}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-[#17324D]/8" aria-hidden>
                    <span className="block h-full rounded-full bg-[#DD5B26]" style={{ width: `${(d.count / maxDistribution) * 100}%` }} />
                  </span>
                  <span className="w-8 text-right text-sm font-extrabold text-[#17324D]">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
          {stats.distribution.some((d) => d.level === null) && (
            <p className="mt-3 text-xs font-bold text-[#17324D]/50">„Неустановено“ = {INCONCLUSIVE_MESSAGE}</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-[#17324D]">Последни резултати</h2>
            <Link href="/admin/english-tests/results" className="text-sm font-extrabold text-[#DD5B26] hover:underline">
              Всички
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="Няма завършени тестове">Резултатите ще се появят тук, след като ученик предаде тест.</EmptyState>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-[#17324D]/8">
              {stats.recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/english-tests/results/${r.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-extrabold text-[#17324D]">{r.studentName}</span>
                      <span className="truncate text-sm font-bold text-[#17324D]/55">
                        {r.testTitle} · {formatDateTime(r.submittedAt)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {r.level && <Pill tone="green">{r.level}</Pill>}
                      <span className="font-extrabold text-[#17324D]">{formatPercent(r.percentage)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </EtShell>
  )
}
