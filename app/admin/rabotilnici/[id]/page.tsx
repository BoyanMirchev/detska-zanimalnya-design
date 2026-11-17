import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { WorkshopEditor } from "@/components/admin/workshop-editor"
import { WorkshopRegistrations } from "@/components/admin/workshop-registrations"
import { getWorkshopById, getWorkshopRegistrations } from "@/lib/workshops/db"
import { formatFreePlaces } from "@/lib/workshops/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Редакция на работилница | Админ", robots: { index: false, follow: false } }

export default async function EditWorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/admin")
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const [workshop, registrations] = await Promise.all([getWorkshopById(numericId), getWorkshopRegistrations(numericId)])
  if (!workshop) notFound()

  return (
    <AdminShell
      title={workshop.title}
      subtitle={`Свободни места: ${formatFreePlaces(workshop)} · Заявки: ${registrations.length}`}
      actions={
        <Link href="/admin/rabotilnici" className="rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm">
          Всички работилници
        </Link>
      }
    >
      <section aria-labelledby="registrations-heading" className="flex flex-col gap-4">
        <h2 id="registrations-heading" className="text-2xl font-extrabold text-[#17324D]">
          Заявки
        </h2>
        <WorkshopRegistrations registrations={registrations} />
      </section>
      <section aria-labelledby="editor-heading" className="flex flex-col gap-4">
        <h2 id="editor-heading" className="text-2xl font-extrabold text-[#17324D]">
          Настройки и съдържание
        </h2>
        <WorkshopEditor key={workshop.id} workshop={workshop} />
      </section>
    </AdminShell>
  )
}
