import "server-only"
import { cache } from "react"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { isAuthenticated as isAdminAuthenticated } from "@/app/actions/admin"
import { ensureEnglishTestsSchema } from "./schema"
import { generateToken, hashToken } from "./crypto"

export const STUDENT_COOKIE = "et_session"
const SESSION_DAYS = 7

export type CurrentStudent = {
  id: number
  username: string
  firstName: string
  lastName: string
  schoolGrade: string | null
  ageGroup: string | null
  createdAt: string
}

export async function createStudentSession(studentId: number) {
  const token = generateToken()
  await sql`
    INSERT INTO et_sessions (student_id, token_hash, expires_at)
    VALUES (${studentId}, ${hashToken(token)}, now() + make_interval(days => ${SESSION_DAYS}))
  `
  const store = await cookies()
  // Matches the existing admin cookie: SameSite=None is required for the embedded v0 preview.
  store.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  })
}

export async function destroyStudentSession() {
  const store = await cookies()
  const token = store.get(STUDENT_COOKIE)?.value
  if (token) {
    await ensureEnglishTestsSchema()
    await sql`DELETE FROM et_sessions WHERE token_hash = ${hashToken(token)}`
  }
  store.delete(STUDENT_COOKIE)
}

export async function revokeAllStudentSessions(studentId: number) {
  await sql`DELETE FROM et_sessions WHERE student_id = ${studentId}`
}

/** Resolves the student from the opaque session cookie. Disabled accounts are treated as signed out. */
export const getCurrentStudent = cache(async (): Promise<CurrentStudent | null> => {
  const store = await cookies()
  const token = store.get(STUDENT_COOKIE)?.value
  if (!token || token.length > 100) return null
  await ensureEnglishTestsSchema()
  const rows = await sql`
    SELECT s.id, s.username, s.first_name, s.last_name, s.school_grade, s.age_group, s.created_at
    FROM et_sessions ses
    JOIN et_students s ON s.id = ses.student_id
    WHERE ses.token_hash = ${hashToken(token)} AND ses.expires_at > now() AND s.status = 'active'
    LIMIT 1
  `
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    schoolGrade: row.school_grade,
    ageGroup: row.age_group,
    createdAt: new Date(row.created_at).toISOString(),
  }
})

export function safeNextPath(value: unknown, fallback = "/testove/dashboard") {
  const next = typeof value === "string" ? value : ""
  // Only same-origin, test-area paths: blocks open redirects such as //evil.com or /\evil.com.
  if (!/^\/(testove|testvai-nivoto-si)(\/[\w\-/]*)?(\?[\w=&%-]*)?$/.test(next)) return fallback
  return next
}

export async function requireStudent(nextPath?: string): Promise<CurrentStudent> {
  const student = await getCurrentStudent()
  if (!student) {
    redirect(nextPath ? `/testove/vhod?next=${encodeURIComponent(nextPath)}` : "/testove/vhod")
  }
  return student
}

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
  }
}

/** For server actions: throws rather than redirecting so callers can return a friendly error. */
export async function requireStudentAction(): Promise<CurrentStudent> {
  const student = await getCurrentStudent()
  if (!student) throw new AuthError()
  return student
}

/** Reuses the existing admin panel authentication (ADMIN_PASSWORD cookie) — no second admin system. */
export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new AuthError()
  await ensureEnglishTestsSchema()
}

export async function requireAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin")
  await ensureEnglishTestsSchema()
}

export async function clientIp() {
  const h = await headers()
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim().slice(0, 64)
}

/** Sliding-window limiter backed by Postgres (no extra infrastructure needed). */
export async function isRateLimited(bucket: string, limit: number, windowSeconds: number) {
  const rows = await sql`
    SELECT count(*)::int AS n FROM et_rate_limits
    WHERE bucket = ${bucket} AND created_at > now() - make_interval(secs => ${windowSeconds})
  `
  return rows[0].n >= limit
}

export async function recordRateLimitHit(bucket: string) {
  await sql`INSERT INTO et_rate_limits (bucket) VALUES (${bucket})`
  if (Math.random() < 0.02) {
    await sql`DELETE FROM et_rate_limits WHERE created_at < now() - interval '2 days'`
  }
}

export async function audit(action: string, entityType: string, entityId: string | number | null, details: object = {}) {
  await sql`
    INSERT INTO et_audit_logs (action, entity_type, entity_id, details)
    VALUES (${action}, ${entityType}, ${entityId === null ? null : String(entityId)}, ${JSON.stringify(details)}::jsonb)
  `
}
