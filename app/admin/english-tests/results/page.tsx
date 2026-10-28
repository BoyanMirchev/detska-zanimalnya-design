import Link from "next/link"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { PAGE_SIZE, listLevels, listResults, listTests } from "@/lib/english-tests/admin-data"
import { EmptyState, EtShell, Pagination, Pill, formatDateTime, formatPercent } from "@/components/admin/english-tests/et-shell"
import { inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

type Search = Record<string, string | undefined>
const num = (v?: string) => (v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined)

export default async function ResultsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdminPage()
  const sp = await searchParams
  const filters = {
    student: sp.student?.slice(0, 100),
    test: num(sp.test),
    level: sp.level?.slice(0, 60),
    from: sp.from,
    to: sp.to,
    minScore: num(sp.min),
    maxScore: num(sp.max),
    page: num(sp.page) ?? 1,
  }
  const [result, tests, levels] = await Promise.all([listResults(filters), listTests(), listLevels()])
  const query = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][])
  const hrefFor = (page: number) => `/admin/english-tests/results?${new URLSearchParams({ ...Object.fromEntries(query), page: String(page) })}`

  return (
    <EtShell
      title="Резултати"
      subtitle="Всички завършени опити. Отворете резултат за подробности по въпроси."
      actions={
        <a href={`/admin/english-tests/results/export?${query}`} className={secondaryButton}>
          Експорт CSV
        </a>
      }
    >
      <form method="get" role="search" className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">Ученик</span>
          <input name="student" defaultValue={filters.student} placeholder="Име или потребител" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">Тест</span>
          <select name="test" defaultValue={filters.test ?? ""} className={inputClass}>
            <option value="">Всички</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">Определено ниво</span>
          <select name="level" defaultValue={filters.level ?? ""} className={inputClass}>
            <option value="">Всички</option>
            <option value="__none__">Неустановено</option>
            {levels.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-extrabold text-[#17324D]/60">Мин. %</span>
            <input name="min" type="number" min={0} max={100} defaultValue={sp.min} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-extrabold text-[#17324D]/60">Макс. %</span>
            <input name="max" type="number" min={0} max={100} defaultValue={sp.max} className={inputClass} />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">От дата</span>
          <input name="from" type="date" defaultValue={sp.from} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">До дата</span>
          <input name="to" type="date" defaultValue={sp.to} className={inputClass} />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:justify-end">
          <Link href="/admin/english-tests/results" className={secondaryButton}>
            Изчисти
          </Link>
          <button type="submit" className={primaryButton}>
            Филтрирай
          </button>
        </div>
      </form>

      {result.rows.length === 0 ? (
        <EmptyState title="Няма резултати">Няма завършени опити, отговарящи на филтрите.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-[#17324D]/8 text-xs uppercase tracking-wide text-[#17324D]/55">
              <tr>
                <th className="px-4 py-3 font-extrabold">Ученик</th>
                <th className="px-2 py-3 font-extrabold">Тест</th>
                <th className="px-2 py-3 font-extrabold">Предаден</th>
                <th className="px-2 py-3 font-extrabold">Верни</th>
                <th className="px-2 py-3 font-extrabold">%</th>
                <th className="px-4 py-3 font-extrabold">Ниво</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17324D]/6 font-bold text-[#17324D]">
              {result.rows.map((r) => (
                <tr key={r.id} className="hover:bg-[#F7FAFC]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/english-tests/results/${r.id}`} className="font-extrabold hover:text-[#DD5B26]">
                      {r.studentName}
                    </Link>
                    <span className="block text-xs text-[#17324D]/50">@{r.username}</span>
                  </td>
                  <td className="px-2 py-3">
                    {r.testTitle}
                    <span className="block text-xs text-[#17324D]/50">
                      Опит {r.attemptNumber}
                      {r.status === "expired" && " · изтекло време"}
                    </span>
                  </td>
                  <td className="px-2 py-3">{formatDateTime(r.submittedAt)}</td>
                  <td className="px-2 py-3">
                    {r.correct}/{r.total}
                  </td>
                  <td className="px-2 py-3">{formatPercent(r.percentage)}</td>
                  <td className="px-4 py-3">
                    {r.level ? <Pill tone="green">{r.level}</Pill> : r.testType === "placement" ? <Pill tone="orange">Неустановено</Pill> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={result.page} total={result.total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
    </EtShell>
  )
}
