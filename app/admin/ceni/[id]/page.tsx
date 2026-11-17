import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { PriceEditor, PriceGroupEditor } from "@/components/admin/price-editor"
import { getAdminGroupByKey, getAdminPriceById } from "@/lib/pricing/db"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Редакция на цена | Админ", robots: { index: false, follow: false } }

export default async function AdminPriceEditPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/admin")
  const { id } = await params
  if (!/^\d{1,9}$/.test(id)) notFound()
  const price = await getAdminPriceById(Number(id))
  if (!price) notFound()
  const group = await getAdminGroupByKey(price.group_key)
  if (!group) notFound()

  return (
    <AdminShell
      title={group.service_name}
      subtitle={`${group.category} · ${group.page_path}`}
      actions={
        <Link
          href="/admin/ceni"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm transition hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Всички цени
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        {/* key forces fresh form state after a save changes updated_at */}
        <PriceEditor key={price.updated_at} price={price} group={group} />
        <PriceGroupEditor key={group.updated_at} group={group} isWorkshop={group.workshop_id !== null} />
      </div>
    </AdminShell>
  )
}
