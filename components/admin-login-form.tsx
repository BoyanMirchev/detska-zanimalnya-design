"use client"

import { useActionState } from "react"
import { Loader2, Lock } from "lucide-react"
import { login, type LoginState } from "@/app/actions/admin"

const initialState: LoginState = {}

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-extrabold text-[#17324D]">
          Парола за достъп
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          placeholder="Въведете парола"
          className="rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D] outline-none transition placeholder:text-[#17324D]/35 focus:border-[#9ED9CA]"
        />
      </div>

      {state.error && (
        <p className="rounded-2xl bg-[#F27B6B]/15 px-4 py-3 text-sm font-extrabold text-[#C7503F]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#17324D] px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
        Вход
      </button>
    </form>
  )
}
