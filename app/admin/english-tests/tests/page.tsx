import Link from "next/link"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { listTests } from "@/lib/english-tests/admin-data"
import { LABELS, type TestStatus } from "@/lib/english-tests/types"
import { EmptyState, EtShell, Pill, formatDateTime } from "@/components/admin/english-tests/et-shell"
import { TestStatusControls } from "@/components/admin/english-tests/test-status-controls"

export const dynamic = "force-dynamic"

const tone = { draft: "gray", published: "green", unpublished: "orange", archived: "gray" } as const

export default async function TestsPage() {
  await requireAdminPage()
  const tests = await listTests()

  return (
    <EtShell
      title="Всички тестове"
      subtitle="Публикувайте, скривайте и архивирайте тестове. Само публикуваните са видими за учениците."
      actions={
        <Link href="/admin/english-tests/create" className="inline-flex items-center rounded-full bg-[#DD5B26] px-6 py-3 font-extrabold text-white shadow-sm transition hover:-translate-y-0.5">
          Нов тест
        </Link>
      }
    >
      {tests.length === 0 ? (
        <EmptyState title="Все още няма тестове">Създайте първия тест от бутона „Нов тест“.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {tests.map((t) => (
            <li key={t.id} className={`flex flex-wrap items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ${t.status === "archived" ? "opacity-60" : ""}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/english-tests/${t.id}/edit`} className="text-lg font-extrabold text-[#17324D] hover:text-[#DD5B26]">
                    {t.title}
                  </Link>
                  <Pill tone={tone[t.status as TestStatus]}>{LABELS.testStatus[t.status as TestStatus]}</Pill>
                  <Pill tone="blue">{t.testType === "placement" ? "Входящ" : `Ниво ${t.levelName ?? ""}`}</Pill>
                  {t.testType === "placement" && !t.rulesVersion && <Pill tone="red">Няма правила за ниво</Pill>}
                </div>
                <p className="mt-1 text-sm font-bold text-[#17324D]/55">
                  {t.questionCount} въпроса ({t.selectionMethod === "random" ? "случаен избор" : "ръчен избор"}) · {t.durationMinutes} мин ·{" "}
                  {t.completed} завършени
                  {(t.availableFrom || t.availableUntil) &&
                    ` · достъпен ${t.availableFrom ? `от ${formatDateTime(t.availableFrom)}` : ""} ${t.availableUntil ? `до ${formatDateTime(t.availableUntil)}` : ""}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/english-tests/results?test=${t.id}`} className="text-sm font-extrabold text-[#DD5B26] hover:underline">
                  Резултати
                </Link>
                <TestStatusControls testId={t.id} status={t.status as TestStatus} compact />
              </div>
            </li>
          ))}
        </ul>
      )}
    </EtShell>
  )
}
