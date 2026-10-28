import { requireAdminPage } from "@/lib/english-tests/auth"
import { listLevels } from "@/lib/english-tests/admin-data"
import { EtShell } from "@/components/admin/english-tests/et-shell"
import { QuestionEditor } from "@/components/admin/english-tests/question-editor"

export const dynamic = "force-dynamic"

export default async function NewQuestionPage() {
  await requireAdminPage()
  const levels = await listLevels()
  return (
    <EtShell title="Нов въпрос" subtitle="Добавете въпрос към банката.">
      <QuestionEditor question={null} levels={levels} />
    </EtShell>
  )
}
