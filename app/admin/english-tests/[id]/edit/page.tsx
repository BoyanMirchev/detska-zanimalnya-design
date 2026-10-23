import { notFound } from "next/navigation"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { getTest, listCategories, listLevels, listPickerQuestions } from "@/lib/english-tests/admin-data"
import { EtShell } from "@/components/admin/english-tests/et-shell"
import { TestBuilder } from "@/components/admin/english-tests/test-builder"
import { PlacementRulesEditor } from "@/components/admin/english-tests/placement-rules-editor"
import { TestStatusControls } from "@/components/admin/english-tests/test-status-controls"
import type { TestStatus } from "@/lib/english-tests/types"

export const dynamic = "force-dynamic"

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage()
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const [test, levels, categories, questions] = await Promise.all([getTest(Number(id)), listLevels(), listCategories(), listPickerQuestions()])
  if (!test) notFound()

  return (
    <EtShell title={test.title} subtitle="Редакция на тест" actions={<TestStatusControls testId={test.id} status={test.status as TestStatus} />}>
      {test.testType === "placement" && (
        <PlacementRulesEditor key={test.placementRules?.version ?? 0} testId={test.id} levels={levels} rules={test.placementRules} />
      )}
      <TestBuilder key={`${test.id}-${test.questionIds.join(",")}`} test={test} levels={levels} categories={categories} questions={questions} />
    </EtShell>
  )
}
