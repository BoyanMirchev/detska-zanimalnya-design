import Link from "next/link"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { PAGE_SIZE, listRecoveryRequests, listStudents } from "@/lib/english-tests/admin-data"
import { Card, EmptyState, EtShell, Pagination, Pill, formatDateTime, formatPercent } from "@/components/admin/english-tests/et-shell"
import { DismissRecoveryButton, StudentActions } from "@/components/admin/english-tests/student-actions"
import { inputClass, primaryButton } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdminPage()
  const sp = await searchParams
  const q = sp.q?.slice(0, 100) ?? ""
  const page = Math.max(1, Number(sp.page) || 1)
  const [students, requests] = await Promise.all([listStudents({ q, page }), listRecoveryRequests()])
  const hrefFor = (p: number) => `/admin/english-tests/students?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`

  return (
    <EtShell title="Ученици" subtitle="Профили, създадени от учениците или техните родители.">
      {requests.length > 0 && (
        <Card>
          <h2 className="text-lg font-extrabold text-[#17324D]">Заявки за възстановяване на достъп</h2>
          <p className="text-sm font-bold text-[#17324D]/55">
            Свържете се с родителя, потвърдете самоличността му и генерирайте линк за нова парола от реда на ученика.
          </p>
          <ul className="mt-3 flex flex-col divide-y divide-[#17324D]/8">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm font-bold text-[#17324D]">
                <span>
                  {r.name ?? "Неизвестен профил"} <span className="text-[#17324D]/50">@{r.username}</span> ·{" "}
                  <span className="text-[#17324D]/50">{formatDateTime(r.createdAt)}</span>
                </span>
                <span className="flex items-center gap-3">
                  {r.studentId && (
                    <Link href={`/admin/english-tests/students?q=${encodeURIComponent(r.username)}`} className="font-extrabold text-[#DD5B26] hover:underline">
                      Намери
                    </Link>
                  )}
                  <DismissRecoveryButton id={r.id} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <form method="get" role="search" className="flex gap-2">
        <input name="q" defaultValue={q} aria-label="Търсене на ученик" placeholder="Име или потребителско име" className={`${inputClass} max-w-md flex-1`} />
        <button type="submit" className={primaryButton}>
          Търси
        </button>
      </form>

      {students.rows.length === 0 ? (
        <EmptyState title="Няма ученици">{q ? "Няма съвпадения за търсенето." : "Все още няма регистрирани ученици."}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {students.rows.map((s) => (
            <li key={s.id} className="flex flex-wrap items-start gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-extrabold text-[#17324D]">{s.name}</span>
                  <span className="text-sm font-bold text-[#17324D]/50">@{s.username}</span>
                  {s.status === "disabled" && <Pill tone="red">Деактивиран</Pill>}
                </div>
                <p className="mt-1 text-sm font-bold text-[#17324D]/55">
                  {[s.schoolGrade && `${s.schoolGrade} клас`, s.ageGroup].filter(Boolean).join(" · ") || "Без допълнителни данни"} · регистриран{" "}
                  {formatDateTime(s.createdAt)}
                </p>
                <p className="mt-1 text-sm font-bold text-[#17324D]">
                  {s.completed} завършени теста
                  {s.completed > 0 && ` · последен резултат ${formatPercent(s.latestPercentage)}${s.latestLevel ? ` (${s.latestLevel})` : ""}`}
                  {s.completed > 0 && (
                    <>
                      {" · "}
                      <Link href={`/admin/english-tests/results?student=${encodeURIComponent(s.username)}`} className="font-extrabold text-[#DD5B26] hover:underline">
                        Резултати
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <StudentActions studentId={s.id} status={s.status} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={students.page} total={students.total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
    </EtShell>
  )
}
