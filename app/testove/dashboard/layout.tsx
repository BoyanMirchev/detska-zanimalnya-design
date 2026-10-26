import type { Metadata } from "next"
import type { ReactNode } from "react"
import { DashboardNav } from "@/components/testove/dashboard-nav"
import { requireStudent } from "@/lib/english-tests/auth"

export const metadata: Metadata = { title: "Моят панел | Тестове по английски", robots: { index: false } }

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const student = await requireStudent("/testove/dashboard")
  return (
    <div className="min-h-dvh bg-et-mist font-sans text-et-navy">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-10 lg:py-10">
        <aside className="lg:w-64 lg:shrink-0">
          <DashboardNav name={`${student.firstName} ${student.lastName}`} />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-6">{children}</main>
      </div>
    </div>
  )
}
