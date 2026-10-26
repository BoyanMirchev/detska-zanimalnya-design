"use client"

import { useState, useTransition } from "react"
import { Loader2, Play } from "lucide-react"
import { startTestAction } from "@/app/actions/english-tests/student"
import { Alert, primaryButton } from "./ui"

export function StartTestButton({ testId }: { testId: number }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const res = await startTestAction(testId)
            if (res?.error) setError(res.error)
          })
        }
        className={`${primaryButton} w-full sm:w-fit`}
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
        Започни теста
      </button>
      {error ? <Alert tone="error">{error}</Alert> : null}
    </div>
  )
}
