import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/testove/auth-card"
import { RegisterForm } from "@/components/testove/auth-forms"
import { getCurrentStudent, safeNextPath } from "@/lib/english-tests/auth"

export const metadata: Metadata = { title: "Регистрация | Тестове по английски", robots: { index: false } }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  if (await getCurrentStudent()) redirect(safeNextPath(next))
  return (
    <AuthCard
      title="Създай профил"
      subtitle="Събираме само нужното: име и потребителско име. Класът и възрастта са по желание."
    >
      <RegisterForm next={next ? safeNextPath(next) : undefined} />
    </AuthCard>
  )
}
