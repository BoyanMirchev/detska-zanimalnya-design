"use client"

import { useState, useTransition } from "react"
import { setRegistrationStatus } from "@/app/actions/workshops-admin"
import { REGISTRATION_STATUS_LABELS, type RegistrationStatus, type WorkshopRegistration } from "@/lib/workshops/types"

const STATUS_TONE: Record<RegistrationStatus, string> = {
  new: "bg-[#FFF4D6] text-[#8A5A00]",
  confirmed: "bg-[#9ED9CA]/35 text-[#1F6B5C]",
  cancelled: "bg-[#17324D]/10 text-[#17324D]/60",
}

function StatusSelect({ registration }: { registration: WorkshopRegistration }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")
  return (
    <div className="flex flex-col gap-1">
      <label className="sr-only" htmlFor={`status-${registration.id}`}>
        {`Статус на заявката на ${registration.parent_name}`}
      </label>
      <select
        id={`status-${registration.id}`}
        defaultValue={registration.status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as RegistrationStatus
          const select = e.target
          setError("")
          startTransition(async () => {
            const res = await setRegistrationStatus(registration.id, next)
            if (res.error) {
              setError(res.error)
              select.value = registration.status
            }
          })
        }}
        className={`rounded-full border-0 px-3 py-1.5 text-sm font-extrabold outline-none ${STATUS_TONE[registration.status]}`}
      >
        {(Object.keys(REGISTRATION_STATUS_LABELS) as RegistrationStatus[]).map((s) => (
          <option key={s} value={s}>
            {REGISTRATION_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {error && <span role="alert" className="text-xs font-bold text-[#B42318]">{error}</span>}
    </div>
  )
}

const dateFmt = new Intl.DateTimeFormat("bg-BG", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Sofia" })

export function WorkshopRegistrations({ registrations }: { registrations: WorkshopRegistration[] }) {
  if (registrations.length === 0) {
    return <p className="rounded-[28px] bg-white p-8 font-bold text-[#17324D]/55 shadow-sm">Все още няма заявки.</p>
  }
  return (
    <div className="overflow-x-auto rounded-[28px] bg-white shadow-sm">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs font-black uppercase tracking-wider text-[#17324D]/50">
          <tr>
            <th className="px-5 py-4">Дата</th>
            <th className="px-5 py-4">Родител</th>
            <th className="px-5 py-4">Контакт</th>
            <th className="px-5 py-4">Дете</th>
            <th className="px-5 py-4">Алергии / бележки</th>
            <th className="px-5 py-4">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#17324D]/5 font-semibold text-[#17324D]">
          {registrations.map((r) => (
            <tr key={r.id} className="align-top">
              <td className="whitespace-nowrap px-5 py-4 text-[#17324D]/60">{dateFmt.format(new Date(r.created_at))}</td>
              <td className="px-5 py-4 font-extrabold">{r.parent_name}</td>
              <td className="px-5 py-4">
                <a href={`tel:${r.phone}`} className="block hover:underline">{r.phone}</a>
                <a href={`mailto:${r.email}`} className="block text-[#17324D]/60 hover:underline">{r.email}</a>
              </td>
              <td className="px-5 py-4">{`${r.child_name}, ${r.child_age} г.`}</td>
              <td className="max-w-xs px-5 py-4 text-[#17324D]/70">
                {r.has_allergies === true && <p className="font-extrabold text-[#B42318]">{`Алергии: ${r.allergy_details}`}</p>}
                {r.has_allergies === false && <p>Без алергии</p>}
                {r.notes && <p className="mt-1 whitespace-pre-line">{r.notes}</p>}
              </td>
              <td className="px-5 py-4">
                <StatusSelect registration={r} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
