import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { History } from "lucide-react"
import { isAuthenticated } from "@/app/actions/admin"
import { AdminShell } from "@/components/admin/admin-shell"
import { PricesOverview } from "@/components/admin/prices-overview"
import { getAdminPriceData } from "@/lib/pricing/db"
import { sofiaToday } from "@/lib/pricing/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Управление на цени | Админ", robots: { index: false, follow: false } }

export default async function AdminPricesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  if (!(await isAuthenticated())) redirect("/admin")
  const [{ groups, prices }, { q }] = await Promise.all([getAdminPriceData(), searchParams])

  return (
    <AdminShell
      title="Управление на цени"
      subtitle="Всички цени, показани на сайта"
      actions={
        <Link
          href="/admin/ceni/istoriya"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-[#17324D] shadow-sm transition hover:-translate-y-0.5"
        >
          <History className="h-5 w-5" aria-hidden="true" />
          История на промените
        </Link>
      }
    >
      <PricesOverview groups={groups} prices={prices} today={sofiaToday()} initialQuery={q?.slice(0, 120) ?? ""} />
    </AdminShell>
  )
}
