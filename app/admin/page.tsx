import { Lock } from "lucide-react"
import { getContactRequests, isAuthenticated } from "@/app/actions/admin"
import { AdminLoginForm } from "@/components/admin-login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminShell } from "@/components/admin/admin-shell"
import { AttentionList, PaymentsSummaryCards } from "@/components/admin/payments-overview"
import { getPaymentsOverview } from "@/lib/students-data"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const authed = await isAuthenticated()

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2F7FB] px-5 pb-16 pt-32 lg:pt-40">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFB37B]/25 text-[#17324D]">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-[#17324D]">Админ панел</h1>
          <p className="mt-2 font-bold leading-7 text-[#17324D]/60">
            Влезте, за да видите запитванията от контактната форма.
          </p>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
      </main>
    )
  }

  const [requests, overview] = await Promise.all([getContactRequests(), getPaymentsOverview()])

  return (
    <AdminShell title="Запитвания от клиенти" subtitle="Всички съобщения, изпратени през сайта.">
      <section aria-label="Плащания" className="flex flex-col gap-4">
        <PaymentsSummaryCards overview={overview} />
        <AttentionList items={overview.attention} limit={6} />
      </section>
      <AdminDashboard requests={requests} />
    </AdminShell>
  )
}
