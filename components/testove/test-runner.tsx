"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, ChevronLeft, ChevronRight, CloudOff, Loader2 } from "lucide-react"
import { saveAnswerAction, submitAttemptAction } from "@/app/actions/english-tests/student"
import type { StudentAttemptView } from "@/lib/english-tests/engine"
import { primaryButton, secondaryButton } from "./ui"

type SaveState = "saved" | "saving" | "error"

const RETRY_MS = 2500

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, "0")
  const ss = String(s).padStart(2, "0")
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function TestRunner({ attempt }: { attempt: StudentAttemptView }) {
  const router = useRouter()
  const { questions, settings } = attempt
  const deadline = Date.parse(attempt.expiresAt)

  // Server/client clock difference, measured once on the client.
  const [offset] = useState(() => Date.parse(attempt.serverNow) - Date.now())
  const [now, setNow] = useState<number | null>(null)
  const [index, setIndex] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>(() =>
    Object.fromEntries(Object.entries(attempt.answers).map(([k, v]) => [k, v.selected])),
  )
  const [saveState, setSaveState] = useState<Record<number, SaveState>>(() =>
    Object.fromEntries(Object.keys(attempt.answers).map((k) => [k, "saved" as const])),
  )
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [closed, setClosed] = useState(false)

  const versions = useRef<Record<number, number>>(
    Object.fromEntries(Object.entries(attempt.answers).map(([k, v]) => [k, v.version])),
  )
  const latest = useRef<Record<number, number[]>>({})
  const inflight = useRef(new Map<number, Promise<void>>())
  const retryTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const finishing = useRef(false)

  const finish = useCallback(
    async (reason: "submit" | "expired") => {
      if (finishing.current) return
      finishing.current = true
      setSubmitting(true)
      setSubmitError(null)
      const res = await submitAttemptAction(attempt.id)
      if (res.ok) {
        router.replace(`/testove/rezultati/${attempt.id}`)
        return
      }
      finishing.current = false
      setSubmitting(false)
      setSubmitError(res.error ?? (reason === "expired" ? "Времето изтече, но предаването не успя." : "Предаването не успя."))
    },
    [attempt.id, router],
  )

  const send = useCallback(
    (qid: number, version: number) => {
      const selected = latest.current[qid] ?? []
      setSaveState((s) => ({ ...s, [qid]: "saving" }))
      const p = saveAnswerAction(attempt.id, qid, selected, version)
        .then((res) => {
          if (versions.current[qid] !== version) return // a newer change owns the status
          if (res.ok) {
            setSaveState((s) => ({ ...s, [qid]: "saved" }))
            return
          }
          if (res.closed) {
            setClosed(true)
            setSaveState((s) => ({ ...s, [qid]: "error" }))
            return
          }
          setSaveState((s) => ({ ...s, [qid]: "error" }))
          const t = setTimeout(() => {
            if (versions.current[qid] === version) send(qid, version)
          }, RETRY_MS)
          retryTimers.current.set(qid, t)
        })
        .catch(() => {
          if (versions.current[qid] !== version) return
          setSaveState((s) => ({ ...s, [qid]: "error" }))
          const t = setTimeout(() => {
            if (versions.current[qid] === version) send(qid, version)
          }, RETRY_MS)
          retryTimers.current.set(qid, t)
        })
        .finally(() => {
          if (inflight.current.get(qid) === p) inflight.current.delete(qid)
        })
      inflight.current.set(qid, p)
    },
    [attempt.id],
  )

  function choose(qid: number, optionId: number, multiple: boolean) {
    if (closed || submitting) return
    const current = answers[qid] ?? []
    if (!settings.allowAnswerChange && current.length > 0) return
    const next = multiple
      ? current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      : [optionId]
    setAnswers((a) => ({ ...a, [qid]: next }))
    latest.current[qid] = next
    const version = (versions.current[qid] ?? 0) + 1
    versions.current[qid] = version
    const timer = retryTimers.current.get(qid)
    if (timer) clearTimeout(timer)
    send(qid, version)
  }

  useEffect(() => {
    const tick = () => setNow(Date.now() + offset)
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [offset])

  const remaining = now === null ? null : deadline - now
  const expired = remaining !== null && remaining <= 0

  useEffect(() => {
    if (expired || closed) finish("expired")
  }, [expired, closed, finish])

  useEffect(() => {
    const timers = retryTimers.current
    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  const pendingCount = Object.values(saveState).filter((s) => s !== "saved").length
  useEffect(() => {
    if (!pendingCount) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [pendingCount])

  async function confirmSubmit() {
    setSubmitError(null)
    await Promise.allSettled([...inflight.current.values()])
    // One immediate retry for anything still failing, then block rather than discard answers.
    const failing = Object.entries(versions.current).filter(([qid]) => saveStateRef.current[Number(qid)] === "error")
    if (failing.length) {
      failing.forEach(([qid, v]) => send(Number(qid), v))
      await Promise.allSettled([...inflight.current.values()])
      if (Object.values(saveStateRef.current).some((s) => s === "error")) {
        setSubmitError("Някои отговори не са запазени. Провери връзката и опитай отново.")
        return
      }
    }
    await finish("submit")
  }

  const saveStateRef = useRef(saveState)
  useEffect(() => {
    saveStateRef.current = saveState
  }, [saveState])

  const q = questions[index]
  const answeredCount = questions.filter((x) => (answers[x.id]?.length ?? 0) > 0).length
  const isMultiple = q.type === "multiple"
  const locked = !settings.allowAnswerChange && (answers[q.id]?.length ?? 0) > 0
  const currentSave = saveState[q.id]
  const lowTime = remaining !== null && remaining < 60_000

  function goTo(i: number) {
    if (i < 0 || i >= questions.length) return
    if (!settings.allowBack && i < index) return
    setIndex(i)
    setMaxReached((m) => Math.max(m, i))
  }

  return (
    <div className="min-h-dvh bg-et-mist font-sans text-et-navy">
      <header className="sticky top-0 z-10 border-b border-et-navy/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="truncate font-display text-lg font-extrabold">{attempt.testTitle}</h1>
            <div
              role="timer"
              aria-live={lowTime ? "assertive" : "off"}
              aria-label="Оставащо време"
              className={`shrink-0 rounded-full px-4 py-1.5 font-mono text-lg font-extrabold tabular-nums ${
                lowTime ? "bg-et-coral/20 text-berry" : "bg-et-navy text-paper"
              }`}
            >
              {remaining === null ? "--:--" : formatRemaining(remaining)}
            </div>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-et-navy/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={answeredCount}
            aria-label="Отговорени въпроси"
          >
            <div
              className="h-full rounded-full bg-et-mint transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
        {closed ? (
          <p role="alert" className="flex items-center gap-2 rounded-2xl bg-et-coral/15 px-4 py-3 font-extrabold text-berry">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            Тестът е приключен. Пренасочваме те към резултата…
          </p>
        ) : null}

        <section aria-labelledby="question-heading" className="flex flex-col gap-6 rounded-3xl border border-et-navy/10 bg-paper p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-extrabold text-et-navy/60">
              Въпрос {index + 1} от {questions.length}
            </p>
            <SaveIndicator state={currentSave} />
          </div>
          <h2 id="question-heading" className="font-display text-2xl font-extrabold leading-snug text-pretty whitespace-pre-line">
            {q.text}
          </h2>
          <fieldset className="flex flex-col gap-3" disabled={closed || submitting}>
            <legend className="sr-only">{isMultiple ? "Избери всички верни отговори" : "Избери един отговор"}</legend>
            {isMultiple ? <p className="text-sm font-bold text-et-navy/60">Избери всички верни отговори.</p> : null}
            {q.options.map((o) => {
              const selected = answers[q.id]?.includes(o.id) ?? false
              return (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 font-bold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-et-navy ${
                    selected ? "border-et-navy bg-et-mint/30" : "border-et-navy/10 hover:border-et-navy/30"
                  } ${locked && !selected ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <input
                    type={isMultiple ? "checkbox" : "radio"}
                    name={`q-${q.id}`}
                    checked={selected}
                    disabled={locked}
                    onChange={() => choose(q.id, o.id, isMultiple)}
                    className="h-5 w-5 accent-et-navy"
                  />
                  <span className="leading-relaxed">{o.text}</span>
                </label>
              )
            })}
          </fieldset>
          {locked ? <p className="text-sm font-bold text-et-navy/60">Отговорът е заключен – в този тест не може да се променя.</p> : null}
        </section>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0 || !settings.allowBack}
            className={secondaryButton}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            Предишен
          </button>
          {index < questions.length - 1 ? (
            <button type="button" onClick={() => goTo(index + 1)} className={primaryButton}>
              Следващ
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} disabled={submitting} className={primaryButton}>
              Предай теста
            </button>
          )}
        </div>

        <nav aria-label="Въпроси" className="flex flex-col gap-3 rounded-3xl border border-et-navy/10 bg-paper p-5">
          <ol className="flex flex-wrap gap-2">
            {questions.map((x, i) => {
              const answered = (answers[x.id]?.length ?? 0) > 0
              const current = i === index
              const reachable = settings.allowBack || i >= index || i <= maxReached
              const failed = saveState[x.id] === "error"
              return (
                <li key={x.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={!reachable || (!settings.allowBack && i < index)}
                    aria-current={current ? "step" : undefined}
                    aria-label={`Въпрос ${i + 1}${answered ? ", отговорен" : ", без отговор"}${failed ? ", не е запазен" : ""}`}
                    className={`h-10 w-10 rounded-xl text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      current
                        ? "bg-et-navy text-paper ring-2 ring-et-navy ring-offset-2"
                        : failed
                          ? "bg-et-coral/25 text-berry"
                          : answered
                            ? "bg-et-mint text-et-navy"
                            : "border-2 border-et-navy/15 bg-paper text-et-navy"
                    }`}
                  >
                    {i + 1}
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-et-navy/60">
            <span>
              Отговорени: {answeredCount} · Без отговор: {questions.length - answeredCount}
            </span>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={submitting}
              className="font-extrabold text-et-navy underline underline-offset-4"
            >
              Предай теста
            </button>
          </div>
        </nav>

        {submitError && !confirming ? (
          <p role="alert" className="rounded-2xl bg-et-coral/15 px-4 py-3 font-extrabold text-berry">
            {submitError}
          </p>
        ) : null}
      </main>

      {confirming ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-et-navy/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-paper p-6 shadow-xl"
          >
            <h2 id="confirm-title" className="font-display text-xl font-extrabold text-balance">
              Сигурен ли си, че искаш да приключиш теста?
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-et-mint/30 p-4">
                <dt className="text-sm font-bold">Отговорени</dt>
                <dd className="font-display text-2xl font-extrabold">{answeredCount}</dd>
              </div>
              <div className="rounded-2xl bg-et-mist p-4">
                <dt className="text-sm font-bold">Без отговор</dt>
                <dd className="font-display text-2xl font-extrabold">{questions.length - answeredCount}</dd>
              </div>
            </dl>
            {pendingCount ? (
              <p className="text-sm font-bold text-et-navy/70">Изчакваме запазването на последните отговори…</p>
            ) : null}
            {submitError ? (
              <p role="alert" className="rounded-2xl bg-et-coral/15 px-4 py-3 text-sm font-extrabold text-berry">
                {submitError}
              </p>
            ) : null}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" autoFocus onClick={() => setConfirming(false)} disabled={submitting} className={secondaryButton}>
                Отказ
              </button>
              <button type="button" onClick={confirmSubmit} disabled={submitting} className={primaryButton}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
                Предай теста
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SaveIndicator({ state }: { state?: SaveState }) {
  if (!state) return <span className="text-xs font-bold text-et-navy/40">Без отговор</span>
  if (state === "saving")
    return (
      <span role="status" className="flex items-center gap-1.5 text-xs font-extrabold text-et-navy/60">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Запазване…
      </span>
    )
  if (state === "error")
    return (
      <span role="alert" className="flex items-center gap-1.5 text-xs font-extrabold text-berry">
        <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
        Не е запазено – опитваме отново
      </span>
    )
  return (
    <span role="status" className="flex items-center gap-1.5 text-xs font-extrabold text-et-navy">
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
      Запазено
    </span>
  )
}
