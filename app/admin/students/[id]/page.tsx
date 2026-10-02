import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { StudentDetail } from "@/components/admin/student-detail"
import { todayISO } from "@/lib/dates"
import { getStudentDetail, getStudentPayments } from "@/lib/students-data"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Ученик | Админ", robots: { index: false, follow: false } }

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/admin")
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const [student, payments] = await Promise.all([getStudentDetail(id), getStudentPayments(id)])
  if (!student) notFound()

  return (
    <AdminShell
      title={`${student.first_name} ${student.last_name}`}
      subtitle={`${student.class} · ${student.parent_name}`}
      actions={
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          Всички ученици
        </Link>
      }
    >
      <StudentDetail student={student} payments={payments} today={todayISO()} />
    </AdminShell>
  )
}
