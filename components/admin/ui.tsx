"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { CheckCircle2, X } from "lucide-react"
import { STATUS_META, type PaymentStatus } from "@/lib/payment-status"

export const inputClass =
  "w-full rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-2.5 font-bold text-[#17324D] outline-none transition placeholder:text-[#17324D]/35 focus:border-[#9ED9CA] aria-[invalid=true]:border-[#F27B6B]"

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#17324D] px-5 py-2.5 font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#17324D]/5 px-5 py-2.5 font-extrabold text-[#17324D] transition hover:bg-[#17324D]/10 disabled:cursor-not-allowed disabled:opacity-60"

export const dangerButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#F27B6B]/15 px-5 py-2.5 font-extrabold text-[#C7503F] transition hover:bg-[#F27B6B]/25 disabled:cursor-not-allowed disabled:opacity-60"

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold ${meta.className}`}>
      {meta.label}
    </span>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  required,
  children,
  className = "",
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-extrabold text-[#17324D]">
        {label}
        {required && <span className="text-[#C7503F]"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-sm font-bold text-[#C7503F]">
          {error}
        </p>
      )}
    </div>
  )
}

/** Native <dialog> gives focus trapping, Escape-to-close and an accessible modal role for free. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-1.5rem)] max-w-xl rounded-3xl bg-white p-0 text-[#17324D] shadow-2xl backdrop:bg-[#17324D]/45"
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-[#17324D]/8 px-6 py-4">
            <h2 id="modal-title" className="text-xl font-extrabold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#17324D]/5 transition hover:bg-[#17324D]/10"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Затвори</span>
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  )
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [message, onDone])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      {message && (
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#17324D] px-5 py-3 font-extrabold text-white shadow-xl">
          <CheckCircle2 className="h-5 w-5 text-[#9ED9CA]" />
          {message}
        </div>
      )}
    </div>
  )
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-2xl bg-[#F27B6B]/15 px-4 py-3 text-sm font-extrabold text-[#C7503F]">
      {message}
    </p>
  )
}
