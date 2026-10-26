"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createPasswordResetLink, dismissRecoveryRequest, setStudentStatus } from "@/app/actions/english-tests/admin"
import { FormError, secondaryButton } from "@/components/admin/ui"

export function StudentActions({ studentId, status }: { studentId: number; status: "active" | "disabled" }) {
  const router = useRouter()
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const resetLink = () =>
    startTransition(async () => {
      setError(null)
      const res = await createPasswordResetLink(studentId)
      if (!res.ok) return setError(res.error ?? "Възникна грешка.")
      if (!res.data) return setError("Възникна грешка.")
      setLink(res.data.url)
      setCopied(false)
    })

  const toggle = () =>
    startTransition(async () => {
      setError(null)
      const res = await setStudentStatus(studentId, status === "active" ? "disabled" : "active")
      if (!res.ok) return setError(res.error ?? "Възникна грешка.")
      router.refresh()
    })

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={pending} onClick={resetLink} className={secondaryButton}>
          Линк за нова парола
        </button>
        <button type="button" disabled={pending} onClick={toggle} className={secondaryButton}>
          {status === "active" ? "Деактивирай" : "Активирай"}
        </button>
      </div>
      {error && <FormError message={error} />}
      {link && (
        <div className="flex w-full max-w-md flex-col gap-2 rounded-2xl bg-[#9ED9CA]/25 p-3 text-left">
          <p className="text-xs font-bold text-[#1F6B5C]">
            Еднократен линк, валиден 24 часа. Изпратете го на родителя само след като сте потвърдили самоличността му.
          </p>
          <div className="flex gap-2">
            <input readOnly value={link} aria-label="Линк за нова парола" className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#17324D]" />
            <button
              type="button"
              className="rounded-full bg-[#1F6B5C] px-4 text-xs font-extrabold text-white"
              onClick={async () => {
                await navigator.clipboard.writeText(link)
                setCopied(true)
              }}
            >
              {copied ? "Копирано" : "Копирай"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DismissRecoveryButton({ id }: { id: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await dismissRecoveryRequest(id)
          router.refresh()
        })
      }
      className="text-sm font-extrabold text-[#17324D]/60 hover:text-[#17324D]"
    >
      Отхвърли
    </button>
  )
}
