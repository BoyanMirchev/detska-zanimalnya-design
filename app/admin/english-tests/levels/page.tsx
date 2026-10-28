import { requireAdminPage } from "@/lib/english-tests/auth"
import { listLevels } from "@/lib/english-tests/admin-data"
import { EtShell } from "@/components/admin/english-tests/et-shell"
import { LevelManagement } from "@/components/admin/english-tests/level-management"

export const dynamic = "force-dynamic"

export default async function LevelsPage() {
  await requireAdminPage()
  const levels = await listLevels()
  return (
    <EtShell title="Нива" subtitle="Управлявайте нивата на владеене.">
      <LevelManagement levels={levels} />
    </EtShell>
  )
}
