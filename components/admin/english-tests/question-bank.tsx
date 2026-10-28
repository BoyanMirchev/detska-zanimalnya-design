"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Copy, Pencil, Trash2 } from "lucide-react"
import { deleteQuestion, duplicateQuestion, setQuestionsStatus, type ActionResult } from "@/app/actions/english-tests/admin"
import type { AdminQuestionRow } from "@/lib/english-tests/admin-data"
import { LABELS } from "@/lib/english-tests/types"
import { FormError, Toast, secondaryButton } from "@/components/admin/ui"
import { EmptyState, Pill } from "./et-shell"

const statusTone = { active: "green", inactive: "orange", archived: "gray" } as const

export function QuestionBank({ rows }: { rows: AdminQuestionRow[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const run = (fn: () => Promise<ActionResult<unknown>>, after?: (id?: number) => void) =>
    startTransition(async () => {
      setError(null)
      const res = await fn()
      if (!res.ok) return setError(res.error ?? "Възникна грешка.")
      if (res.message) setToast(res.message)
      setSelected(new Set())
      after?.((res.data as { id?: number } | undefined)?.id)
      router.refresh()
    })

  if (rows.length === 0) {
    return (
      <EmptyState title="Няма намерени въпроси">
        Променете филтрите или{" "}
        <Link href="/admin/english-tests/questions/new" className="text-[#DD5B26] underline">
          създайте нов въпрос
        </Link>
        .
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <FormError message={error} />
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <span className="mr-auto text-sm font-extrabold text-[#17324D]">Избрани: {selected.size}</span>
        {(["active", "inactive", "archived"] as const).map((status) => (
          <button
            key={status}
            type="button"
            disabled={pending || selected.size === 0}
            className={secondaryButton}
            onClick={() => run(() => setQuestionsStatus([...selected], status))}
          >
            {status === "active" ? "Активирай" : status === "inactive" ? "Деактивирай" : "Архивирай"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-[#17324D]/8 text-xs uppercase tracking-wide text-[#17324D]/55">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Избери всички"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
                  className="h-4 w-4 accent-[#DD5B26]"
                />
              </th>
              <th className="px-2 py-3 font-extrabold">Въпрос</th>
              <th className="px-2 py-3 font-extrabold">Ниво</th>
              <th className="px-2 py-3 font-extrabold">Тестове</th>
              <th className="px-2 py-3 font-extrabold">Статус</th>
              <th className="px-4 py-3 text-right font-extrabold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17324D]/6 font-bold text-[#17324D]">
            {rows.map((q) => (
              <tr key={q.id} className={selected.has(q.id) ? "bg-[#DD5B26]/5" : undefined}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Избери въпрос ${q.id}`}
                    checked={selected.has(q.id)}
                    onChange={() => toggle(q.id)}
                    className="h-4 w-4 accent-[#DD5B26]"
                  />
                </td>
                <td className="max-w-xs px-2 py-3">
                  <Link href={`/admin/english-tests/questions/${q.id}`} lang="en" className="line-clamp-2 hover:text-[#DD5B26]">
                    {q.text}
                  </Link>
                  <span className="text-xs text-[#17324D]/50">
                    {LABELS.questionType[q.type]} · {q.optionCount} отговора
                  </span>
                </td>
                <td className="px-2 py-3">{q.levelName}</td>
                <td className="px-2 py-3">{q.testCount}</td>
                <td className="px-2 py-3">
                  <Pill tone={statusTone[q.status]}>{LABELS.questionStatus[q.status]}</Pill>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/english-tests/questions/${q.id}`} className="rounded-full p-2 hover:bg-[#17324D]/5">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Редакция</span>
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-full p-2 hover:bg-[#17324D]/5"
                      onClick={() => run(() => duplicateQuestion(q.id))}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Дублирай</span>
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-full p-2 text-[#C7503F] hover:bg-[#F27B6B]/15"
                      onClick={() => {
                        if (confirm("Да изтрия ли въпроса окончателно? Той ще бъде премахнат и от тестовете, в които участва. Досегашните резултати остават непроменени.")) run(() => deleteQuestion(q.id))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Изтрий</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
