import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/testove/auth-card"
import { RecoveryForm } from "@/components/testove/auth-forms"

export const metadata: Metadata = { title: "Забравена парола | Тестове по английски", robots: { index: false } }

export default function RecoveryPage() {
  return (
    <AuthCard
      title="Забравена парола?"
      subtitle="Въведи потребителското си име. Заявката отива при преподавател, който ще потвърди, че профилът е твой, и ще ти даде линк за нова парола."
    >
      <RecoveryForm />
      <Link href="/testove/vhod" className="text-center text-sm font-extrabold text-et-navy underline underline-offset-4">
        Обратно към входа
      </Link>
    </AuthCard>
  )
}
