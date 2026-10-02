import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { StudentsTable } from "@/components/admin/students-table"
import { todayISO } from "@/lib/dates"
import { getStudentRows } from "@/lib/students-data"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Ученици и плащания | Админ", robots: { index: false, follow: false } }

export default async function StudentsPage() {
  if (!(await isAuthenticated())) redirect("/admin")
  const students = await getStudentRows()

  return (
    <AdminShell title="Ученици и плащания" subtitle="Такси за занималня и кетъринг на всички ученици.">
      <StudentsTable students={students} today={todayISO()} />
    </AdminShell>
  )
}
