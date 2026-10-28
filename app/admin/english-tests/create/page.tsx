import { requireAdminPage } from "@/lib/english-tests/auth"
import { listLevels, listPickerQuestions } from "@/lib/english-tests/admin-data"
import { EtShell } from "@/components/admin/english-tests/et-shell"
import { TestBuilder } from "@/components/admin/english-tests/test-builder"

export const dynamic = "force-dynamic"

export default async function CreateTestPage() {
  await requireAdminPage()
  const [levels, questions] = await Promise.all([listLevels(), listPickerQuestions()])
  return (
    <EtShell
      title="Създаване на тест"
      subtitle="Тестът се създава като чернова. След запазване ще можете да зададете правила за ниво и да го публикувате."
    >
      <TestBuilder test={null} levels={levels} questions={questions} />
    </EtShell>
  )
}
