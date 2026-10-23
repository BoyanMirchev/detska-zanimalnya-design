import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/testove/auth-card"
import { LoginForm } from "@/components/testove/auth-forms"
import { getCurrentStudent, safeNextPath } from "@/lib/english-tests/auth"

export const metadata: Metadata = { title: "Вход | Тестове по английски", robots: { index: false } }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  if (await getCurrentStudent()) redirect(safeNextPath(next))
  return (
    <AuthCard title="Вход" subtitle="Влез с потребителското си име, за да продължиш към тестовете.">
      <LoginForm next={next ? safeNextPath(next) : undefined} />
    </AuthCard>
  )
}
