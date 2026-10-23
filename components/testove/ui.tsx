import type { ReactNode } from "react"

export const inputClass =
  "w-full rounded-2xl border-2 border-et-navy/10 bg-et-mist px-4 py-3 font-bold text-et-navy outline-none transition placeholder:text-et-navy/35 focus:border-et-mint"

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-et-navy px-7 py-3.5 font-extrabold text-paper transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-et-navy/15 bg-paper px-6 py-3 font-extrabold text-et-navy transition hover:border-et-navy/40 disabled:cursor-not-allowed disabled:opacity-60"

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-extrabold text-et-navy">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs font-bold text-et-navy/55">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm font-extrabold text-berry">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Alert({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "bg-et-coral/15 text-berry",
    success: "bg-et-mint/30 text-et-navy",
    info: "bg-et-mist text-et-navy",
  }[tone]
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm font-extrabold ${styles}`}>
      {children}
    </p>
  )
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-et-navy/10 bg-paper p-6 shadow-sm ${className}`}>{children}</section>
}

export function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("bg-BG", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Sofia" }).format(
    new Date(value),
  )
}

export const STATUS_LABELS: Record<string, string> = {
  in_progress: "В процес",
  grading: "Оценява се",
  submitted: "Предаден",
  expired: "Изтекло време",
}
