import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { WorkshopEditor } from "@/components/admin/workshop-editor"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Нова работилница | Админ", robots: { index: false, follow: false } }

export default async function NewWorkshopPage() {
  if (!(await isAuthenticated())) redirect("/admin")
  return (
    <AdminShell
      title="Нова работилница"
      actions={
        <Link href="/admin/rabotilnici" className="rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm">
          Назад
        </Link>
      }
    >
      <WorkshopEditor />
    </AdminShell>
  )
}
