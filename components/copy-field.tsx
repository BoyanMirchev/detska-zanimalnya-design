"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Копирай ${label}`}
      className="inline-flex items-center gap-2 rounded-full bg-brand/12 px-3 py-1.5 text-sm font-black text-brand-dark transition hover:bg-brand/20"
    >
      {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
      {copied ? "Копирано" : "Копирай"}
    </button>
  )
}
