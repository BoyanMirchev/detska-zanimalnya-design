import { requireAdminPage } from "@/lib/english-tests/auth"
import { listAuditLog } from "@/lib/english-tests/admin-data"
import { DEFAULT_TEST_SETTINGS, INCONCLUSIVE_MESSAGE } from "@/lib/english-tests/types"
import { Card, EtShell, formatDateTime } from "@/components/admin/english-tests/et-shell"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  await requireAdminPage()
  const log = await listAuditLog(60)
  const defaults = [
    ["Разбъркване на въпросите", DEFAULT_TEST_SETTINGS.shuffleQuestions],
    ["Разбъркване на отговорите", DEFAULT_TEST_SETTINGS.shuffleOptions],
    ["Връщане назад", DEFAULT_TEST_SETTINGS.allowBack],
    ["Показване на верните отговори", DEFAULT_TEST_SETTINGS.showCorrectAnswers],
  ] as const

  return (
    <EtShell title="Настройки" subtitle="Правила по подразбиране и журнал на действията.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-extrabold text-[#17324D]">Подразбиращи се правила за нов тест</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm font-bold text-[#17324D]">
            {defaults.map(([label, value]) => (
              <li key={label} className="flex justify-between rounded-2xl bg-[#F7FAFC] px-4 py-2">
                {label}
                <span className="font-extrabold">{value ? "Да" : "Не"}</span>
              </li>
            ))}
            <li className="flex justify-between rounded-2xl bg-[#F7FAFC] px-4 py-2">
              Максимален брой опити
              <span className="font-extrabold">{DEFAULT_TEST_SETTINGS.maxAttempts || "Без ограничение"}</span>
            </li>
          </ul>
          <p className="mt-3 text-xs font-bold text-[#17324D]/55">Всяко правило може да се промени индивидуално за всеки тест.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-extrabold text-[#17324D]">Как работи оценяването</h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm font-bold leading-relaxed text-[#17324D]/80">
            <li>Отговорите се оценяват само на сървъра; верните отговори никога не се изпращат към браузъра по време на теста.</li>
            <li>Въпроси с няколко верни отговора се оценяват „всичко или нищо“.</li>
            <li>Времето се следи от сървъра — при изтичане опитът се предава автоматично със запазените отговори.</li>
            <li>Всеки опит пази копие на въпросите и правилата, така че промените не засягат стари резултати.</li>
            <li>Ако нивото не може да бъде определено, ученикът вижда: „{INCONCLUSIVE_MESSAGE}“</li>
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-extrabold text-[#17324D]">Журнал на действията</h2>
        {log.length === 0 ? (
          <p className="mt-2 text-sm font-bold text-[#17324D]/55">Все още няма записи.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[#17324D]/55">
                <tr>
                  <th className="py-2 font-extrabold">Кога</th>
                  <th className="py-2 font-extrabold">Действие</th>
                  <th className="py-2 font-extrabold">Обект</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17324D]/6 font-bold text-[#17324D]">
                {log.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(e.createdAt)}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{e.action}</td>
                    <td className="py-2">
                      {e.entityType} #{e.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </EtShell>
  )
}
