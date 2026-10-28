import { notFound } from "next/navigation"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { getQuestion, listLevels } from "@/lib/english-tests/admin-data"
import { EtShell } from "@/components/admin/english-tests/et-shell"
import { QuestionEditor } from "@/components/admin/english-tests/question-editor"

export const dynamic = "force-dynamic"

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage()
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const [question, levels] = await Promise.all([getQuestion(Number(id)), listLevels()])
  if (!question) notFound()
  return (
    <EtShell title={`Въпрос #${question.id}`} subtitle={`Версия ${question.version}`}>
      <QuestionEditor key={`${question.id}-${question.version}`} question={question} levels={levels} />
    </EtShell>
  )
}
