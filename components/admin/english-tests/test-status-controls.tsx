"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { setTestStatus } from "@/app/actions/english-tests/admin"
import { LABELS, type TestStatus } from "@/lib/english-tests/types"
import { FormError, Toast, primaryButton, secondaryButton } from "@/components/admin/ui"
import { Pill } from "./et-shell"

const tone = { draft: "gray", published: "green", unpublished: "orange", archived: "gray" } as const

export function TestStatusControls({ testId, status, compact = false }: { testId: number; status: TestStatus; compact?: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const change = (next: TestStatus) =>
    startTransition(async () => {
      setError(null)
      const res = await setTestStatus(testId, next)
      if (!res.ok) return setError(res.error ?? "Възникна грешка.")
      setToast(res.message ?? "Обновено.")
      router.refresh()
    })

  const actions: { to: TestStatus; label: string; primary?: boolean }[] =
    status === "published"
      ? [{ to: "unpublished", label: "Скрий" }]
      : status === "archived"
        ? [{ to: "draft", label: "Възстанови като чернова" }]
        : [
            { to: "published", label: "Публикувай", primary: true },
            { to: "archived", label: "Архивирай" },
          ]

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {!compact && <Pill tone={tone[status]}>{LABELS.testStatus[status]}</Pill>}
        {actions.map((a) => (
          <button key={a.to} type="button" disabled={pending} onClick={() => change(a.to)} className={a.primary ? primaryButton : secondaryButton}>
            {a.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="max-w-md text-left">
          <FormError message={error} />
        </div>
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
