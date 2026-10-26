"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react"
import { moveLevel, saveCategory, saveLevel, setCategoryActive, setLevelState } from "@/app/actions/english-tests/admin"
import type { AdminCategory, AdminLevel } from "@/lib/english-tests/admin-data"
import { Field, FormError, Modal, Toast, inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"
import { Pill } from "./et-shell"

type Editing = { kind: "level"; item: AdminLevel | null } | { kind: "category"; item: AdminCategory | null } | null

export function LevelManagement({ levels, categories }: { levels: AdminLevel[]; categories: AdminCategory[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Editing>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    startTransition(async () => {
      setError(null)
      const res = await fn()
      if (!res.ok) setError(res.error ?? "Възникна грешка.")
      else {
        if (res.message) setToast(res.message)
        router.refresh()
      }
    })

  const activeLevels = levels.filter((l) => !l.archived)

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="levels-title">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="levels-title" className="text-lg font-extrabold text-[#17324D]">
              Нива на владеене
            </h2>
            <p className="text-sm font-bold text-[#17324D]/55">Подредбата определя реда от най-ниско към най-високо ниво.</p>
          </div>
          <button type="button" className={primaryButton} onClick={() => setEditing({ kind: "level", item: null })}>
            <Plus className="h-4 w-4" /> Ниво
          </button>
        </div>
        <FormError message={error} />
        <ul className="mt-4 flex flex-col gap-2">
          {levels.map((level) => {
            const index = activeLevels.indexOf(level)
            return (
              <li key={level.id} className={`flex flex-wrap items-center gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-3 ${level.archived ? "opacity-60" : ""}`}>
                <div className="flex flex-col">
                  <button
                    type="button"
                    disabled={pending || level.archived || index <= 0}
                    onClick={() => run(() => moveLevel(level.id, "up"))}
                    className="rounded p-0.5 text-[#17324D]/60 hover:text-[#17324D] disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Премести нагоре {level.name}</span>
                  </button>
                  <button
                    type="button"
                    disabled={pending || level.archived || index === activeLevels.length - 1}
                    onClick={() => run(() => moveLevel(level.id, "down"))}
                    className="rounded p-0.5 text-[#17324D]/60 hover:text-[#17324D] disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                    <span className="sr-only">Премести надолу {level.name}</span>
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-extrabold text-[#17324D]">
                    {level.name}
                    {level.archived ? <Pill>Архивирано</Pill> : level.isActive ? <Pill tone="green">Активно</Pill> : <Pill tone="orange">Неактивно</Pill>}
                  </p>
                  <p className="truncate text-sm font-bold text-[#17324D]/55">
                    {level.description || "Без описание"} · {level.questionCount} въпроса
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={secondaryButton} onClick={() => setEditing({ kind: "level", item: level })}>
                    <Pencil className="h-4 w-4" /> <span className="sr-only sm:not-sr-only">Редакция</span>
                  </button>
                  {level.archived ? (
                    <button type="button" disabled={pending} className={secondaryButton} onClick={() => run(() => setLevelState(level.id, "restore"))}>
                      Възстанови
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        className={secondaryButton}
                        onClick={() => run(() => setLevelState(level.id, level.isActive ? "inactive" : "active"))}
                      >
                        {level.isActive ? "Деактивирай" : "Активирай"}
                      </button>
                      <button type="button" disabled={pending} className={secondaryButton} onClick={() => run(() => setLevelState(level.id, "archived"))}>
                        Архивирай
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs font-bold text-[#17324D]/50">
          Архивирането не изтрива нивото — историческите резултати остават непроменени.
        </p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-labelledby="categories-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="categories-title" className="text-lg font-extrabold text-[#17324D]">
            Категории
          </h2>
          <button type="button" className={primaryButton} onClick={() => setEditing({ kind: "category", item: null })}>
            <Plus className="h-4 w-4" /> Категория
          </button>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-extrabold text-[#17324D]">
                  {c.name} {!c.isActive && <Pill tone="orange">Неактивна</Pill>}
                </p>
                <p className="text-sm font-bold text-[#17324D]/55">{c.questionCount} въпроса</p>
              </div>
              <button type="button" className={secondaryButton} onClick={() => setEditing({ kind: "category", item: c })}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Редакция на {c.name}</span>
              </button>
              <button type="button" disabled={pending} className={secondaryButton} onClick={() => run(() => setCategoryActive(c.id, !c.isActive))}>
                {c.isActive ? "Скрий" : "Покажи"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <EditDialog
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={(message) => {
          setEditing(null)
          setToast(message)
          router.refresh()
        }}
        nextOrder={levels.length + 1}
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

function EditDialog({
  editing,
  onClose,
  onSaved,
  nextOrder,
}: {
  editing: Editing
  onClose: () => void
  onSaved: (message: string) => void
  nextOrder: number
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const isLevel = editing?.kind === "level"
  const item = editing?.item

  function submit(form: FormData) {
    startTransition(async () => {
      setErrors({})
      setError(null)
      const name = String(form.get("name") ?? "")
      const description = String(form.get("description") ?? "")
      const res = isLevel
        ? await saveLevel(item?.id ?? null, { name, description, displayOrder: Number(form.get("displayOrder")) })
        : await saveCategory(item?.id ?? null, { name, description })
      if (res.ok) onSaved(res.message ?? "Запазено.")
      else {
        setErrors(res.errors ?? {})
        setError(res.error ?? null)
      }
    })
  }

  return (
    <Modal open={editing !== null} onClose={onClose} title={`${item ? "Редакция" : "Ново"} ${isLevel ? "ниво" : "категория"}`}>
      <form key={`${editing?.kind}-${item?.id ?? "new"}`} action={submit} className="flex flex-col gap-4">
        <FormError message={error} />
        <Field label="Име" htmlFor="et-name" error={errors.name} required>
          <input id="et-name" name="name" defaultValue={item?.name ?? ""} maxLength={60} className={inputClass} aria-invalid={!!errors.name} required />
        </Field>
        <Field label="Описание" htmlFor="et-description" error={errors.description}>
          <textarea id="et-description" name="description" rows={3} maxLength={500} defaultValue={item?.description ?? ""} className={inputClass} />
        </Field>
        {isLevel && (
          <Field label="Позиция" htmlFor="et-order" error={errors.displayOrder}>
            <input
              id="et-order"
              name="displayOrder"
              type="number"
              min={0}
              max={1000}
              defaultValue={(item as AdminLevel | null | undefined)?.displayOrder ?? nextOrder}
              className={inputClass}
            />
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className={secondaryButton} onClick={onClose}>
            Отказ
          </button>
          <button type="submit" className={primaryButton} disabled={pending}>
            {pending ? "Запазване…" : "Запази"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
