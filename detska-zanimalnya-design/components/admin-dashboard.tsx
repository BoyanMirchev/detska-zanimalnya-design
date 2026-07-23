"use client"

import { useMemo, useState, useTransition } from "react"
import { Baby, Check, Clock3, ImageIcon, Mail, Phone, Trash2 } from "lucide-react"
import type { ContactRequest } from "@/lib/db"
import { deleteRequest, updateStatus } from "@/app/actions/admin"

const STATUSES = [
  { value: "new", label: "Нови" },
  { value: "in_progress", label: "В процес" },
  { value: "done", label: "Приключени" },
]

const STATUS_STYLES: Record<string, string> = {
  new: "bg-[#FFB37B]/25 text-[#9A5A21]",
  in_progress: "bg-[#9ED9CA]/30 text-[#1F6B5C]",
  done: "bg-[#17324D]/10 text-[#17324D]",
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("bg-BG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function AdminDashboard({ requests }: { requests: ContactRequest[] }) {
  const [filter, setFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()

  const counts = useMemo(() => {
    return {
      all: requests.length,
      new: requests.filter((r) => r.status === "new").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      done: requests.filter((r) => r.status === "done").length,
    }
  }, [requests])

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Всички" value={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
        <StatCard label="Нови" value={counts.new} active={filter === "new"} onClick={() => setFilter("new")} />
        <StatCard
          label="В процес"
          value={counts.in_progress}
          active={filter === "in_progress"}
          onClick={() => setFilter("in_progress")}
        />
        <StatCard label="Приключени" value={counts.done} active={filter === "done"} onClick={() => setFilter("done")} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#17324D]/15 bg-white px-6 py-16 text-center">
          <p className="font-extrabold text-[#17324D]">Няма запитвания в тази категория.</p>
          <p className="mt-1 font-bold text-[#17324D]/55">Новите съобщения от сайта ще се появят тук.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((req) => (
            <li
              key={req.id}
              className="rounded-3xl border-2 border-[#17324D]/8 bg-white p-5 shadow-sm transition hover:border-[#17324D]/15 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-extrabold text-[#17324D]">{req.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                        STATUS_STYLES[req.status] ?? STATUS_STYLES.new
                      }`}
                    >
                      {STATUSES.find((s) => s.value === req.status)?.label ?? req.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-[#17324D]/70">
                    <a href={`mailto:${req.email}`} className="inline-flex items-center gap-1.5 hover:text-[#3E8F82]">
                      <Mail className="h-4 w-4" />
                      {req.email}
                    </a>
                    {req.phone && (
                      <a href={`tel:${req.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#3E8F82]">
                        <Phone className="h-4 w-4" />
                        {req.phone}
                      </a>
                    )}
                    {req.child_age && (
                      <span className="inline-flex items-center gap-1.5">
                        <Baby className="h-4 w-4" />
                        {req.child_age}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[#17324D]/45">
                      <Clock3 className="h-4 w-4" />
                      {formatDate(req.created_at)}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#F7FAFC] px-4 py-3 font-semibold leading-7 text-[#17324D]/85">
                    {req.message}
                  </p>

                  {Array.isArray(req.image_paths) && req.image_paths.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-[#17324D]/70">
                        <ImageIcon className="h-4 w-4" />
                        Прикачени снимки ({req.image_paths.length})
                      </p>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                        {req.image_paths.map((path) => {
                          const src = `/api/file?pathname=${encodeURIComponent(path)}`
                          return (
                            <a
                              key={path}
                              href={src}
                              target="_blank"
                              rel="noreferrer"
                              className="group aspect-square overflow-hidden rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={src || "/placeholder.svg"}
                                alt="Снимка от клиент"
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#17324D]/8 pt-4">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={isPending || req.status === s.value}
                    onClick={() => startTransition(() => updateStatus(req.id, s.value))}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold transition disabled:cursor-not-allowed ${
                      req.status === s.value
                        ? "bg-[#17324D] text-white"
                        : "bg-[#17324D]/5 text-[#17324D] hover:bg-[#17324D]/10"
                    }`}
                  >
                    {req.status === s.value && <Check className="h-4 w-4" />}
                    {s.label}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("Да изтрия ли това запитване?")) {
                      startTransition(() => deleteRequest(req.id))
                    }
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#F27B6B]/15 px-4 py-2 text-sm font-extrabold text-[#C7503F] transition hover:bg-[#F27B6B]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Изтрий
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-3xl border-2 px-5 py-4 text-left transition ${
        active
          ? "border-[#17324D] bg-[#17324D] text-white"
          : "border-[#17324D]/8 bg-white text-[#17324D] hover:border-[#17324D]/20"
      }`}
    >
      <span className="text-3xl font-extrabold">{value}</span>
      <span className={`text-sm font-extrabold ${active ? "text-white/80" : "text-[#17324D]/55"}`}>{label}</span>
    </button>
  )
}
