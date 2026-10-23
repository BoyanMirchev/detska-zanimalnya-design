import { requireStudent } from "@/lib/english-tests/auth"
import { PasswordForm, ProfileForm } from "@/components/testove/profile-forms"
import { Panel, formatDate } from "@/components/testove/ui"

export default async function ProfilePage() {
  const student = await requireStudent("/testove/dashboard/profil")
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Моят профил</h1>
      <Panel className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-extrabold">Лични данни</h2>
          <p className="text-sm font-bold text-et-navy/60">
            Потребителско име: <span className="font-extrabold text-et-navy">{student.username}</span> · Профил от{" "}
            {formatDate(student.createdAt)}
          </p>
        </div>
        <ProfileForm student={student} />
      </Panel>
      <Panel className="flex flex-col gap-5">
        <h2 className="font-display text-xl font-extrabold">Смяна на парола</h2>
        <PasswordForm />
      </Panel>
    </>
  )
}
