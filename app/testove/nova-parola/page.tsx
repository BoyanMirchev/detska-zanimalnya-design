import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/testove/auth-card"
import { ResetForm } from "@/components/testove/auth-forms"
import { Alert } from "@/components/testove/ui"

export const metadata: Metadata = { title: "Нова парола | Тестове по английски", robots: { index: false } }

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return (
    <AuthCard title="Нова парола" subtitle="Линкът е еднократен и важи ограничено време.">
      {token ? (
        <ResetForm token={token} />
      ) : (
        <>
          <Alert tone="error">Линкът е невалиден или е изтекъл.</Alert>
          <Link href="/testove/zabravena-parola" className="text-center text-sm font-extrabold text-et-navy underline underline-offset-4">
            Нова заявка
          </Link>
        </>
      )}
    </AuthCard>
  )
}
