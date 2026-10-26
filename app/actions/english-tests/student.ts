"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { ensureEnglishTestsSchema } from "@/lib/english-tests/schema"
import { getDummyHash, hashPassword, hashToken, verifyPassword } from "@/lib/english-tests/crypto"
import {
  AuthError,
  clientIp,
  createStudentSession,
  destroyStudentSession,
  isRateLimited,
  recordRateLimitHit,
  requireStudentAction,
  revokeAllStudentSessions,
  safeNextPath,
} from "@/lib/english-tests/auth"
import {
  AGE_GROUPS,
  SCHOOL_GRADES,
  normalizeUsername,
  validatePassword,
  validateRegistration,
  type Errors,
} from "@/lib/english-tests/validation"
import { finalizeAttempt, isUuid, saveAnswer, startAttempt, type SaveAnswerResult } from "@/lib/english-tests/engine"

export type FormState = { error?: string; errors?: Errors; success?: string; values?: Record<string, string> }

const GENERIC_ERROR = "Възникна грешка. Моля, опитай отново."

/* ---------------- Registration ---------------- */

export async function registerStudent(_prev: FormState, form: FormData): Promise<FormState> {
  const values = {
    firstName: String(form.get("firstName") ?? ""),
    lastName: String(form.get("lastName") ?? ""),
    username: String(form.get("username") ?? ""),
    schoolGrade: String(form.get("schoolGrade") ?? ""),
    ageGroup: String(form.get("ageGroup") ?? ""),
  }
  const parsed = validateRegistration(form)
  if (!parsed.ok) return { errors: parsed.errors, values }

  await ensureEnglishTestsSchema()
  const ipBucket = `register:ip:${await clientIp()}`
  if (await isRateLimited(ipBucket, 10, 3600)) {
    return { error: "Твърде много регистрации от това устройство. Опитай отново по-късно.", values }
  }

  const { firstName, lastName, username, password, schoolGrade, ageGroup } = parsed.data
  const passwordHash = await hashPassword(password)
  const inserted = await sql`
    INSERT INTO et_students (username, password_hash, first_name, last_name, school_grade, age_group)
    VALUES (${username}, ${passwordHash}, ${firstName}, ${lastName}, ${schoolGrade}, ${ageGroup})
    ON CONFLICT DO NOTHING
    RETURNING id
  `
  await recordRateLimitHit(ipBucket)
  if (!inserted[0]) {
    return { errors: { username: "Това потребителско име е заето. Избери друго." }, values }
  }

  await createStudentSession(inserted[0].id)
  redirect(safeNextPath(form.get("next")))
}

/* ---------------- Login ---------------- */

export async function loginStudent(_prev: FormState, form: FormData): Promise<FormState> {
  const username = normalizeUsername(form.get("username"))
  const password = String(form.get("password") ?? "")
  const values = { username }
  if (!username || !password) return { error: "Въведи потребителско име и парола.", values }

  await ensureEnglishTestsSchema()
  const ip = await clientIp()
  const userBucket = `login:user:${username.slice(0, 40)}`
  const ipBucket = `login:ip:${ip}`
  if ((await isRateLimited(userBucket, 8, 900)) || (await isRateLimited(ipBucket, 30, 900))) {
    return { error: "Твърде много неуспешни опити. Изчакай 15 минути и опитай отново.", values }
  }

  const [student] = await sql`
    SELECT id, password_hash, status FROM et_students WHERE lower(username) = ${username} LIMIT 1
  `
  // Always run a hash comparison so response time does not reveal whether the username exists.
  const valid = await verifyPassword(password, student?.password_hash ?? (await getDummyHash()))
  if (!student || !valid || student.status !== "active") {
    await recordRateLimitHit(userBucket)
    await recordRateLimitHit(ipBucket)
    return { error: "Грешно потребителско име или парола.", values }
  }

  await createStudentSession(student.id)
  redirect(safeNextPath(form.get("next")))
}

export async function logoutStudent() {
  await destroyStudentSession()
  redirect("/testove/vhod")
}

/* ---------------- Recovery ---------------- */

export async function requestPasswordRecovery(_prev: FormState, form: FormData): Promise<FormState> {
  const username = normalizeUsername(form.get("username"))
  const success =
    "Заявката е приета. Ако профилът съществува, администратор от „Хралупата“ ще се свърже с родителя, ще потвърди самоличността и ще предостави еднократен линк за нова парола."
  if (!username) return { error: "Въведи потребителско име." }

  await ensureEnglishTestsSchema()
  const ipBucket = `recovery:ip:${await clientIp()}`
  if (await isRateLimited(ipBucket, 5, 3600)) return { success }
  await recordRateLimitHit(ipBucket)

  const [student] = await sql`SELECT id FROM et_students WHERE lower(username) = ${username} LIMIT 1`
  if (student) {
    const pending = await sql`
      SELECT 1 FROM et_recovery_requests WHERE student_id = ${student.id} AND status = 'pending' LIMIT 1
    `
    if (!pending[0]) {
      await sql`
        INSERT INTO et_recovery_requests (username_entered, student_id) VALUES (${username}, ${student.id})
      `
    }
  }
  // Identical response whether or not the account exists.
  return { success }
}

export async function resetPasswordWithToken(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "")
  const password = String(form.get("password") ?? "")
  const confirm = String(form.get("confirmPassword") ?? "")
  if (!token || token.length > 100) return { error: "Линкът е невалиден или е изтекъл." }

  await ensureEnglishTestsSchema()
  const [row] = await sql`
    SELECT t.id, t.student_id, s.username FROM et_password_reset_tokens t
    JOIN et_students s ON s.id = t.student_id
    WHERE t.token_hash = ${hashToken(token)} AND t.used_at IS NULL AND t.expires_at > now()
  `
  if (!row) return { error: "Линкът е невалиден или е изтекъл." }

  const passwordError = validatePassword(password, row.username)
  if (passwordError) return { errors: { password: passwordError } }
  if (password !== confirm) return { errors: { confirmPassword: "Паролите не съвпадат." } }

  // Single use: only the request that flips used_at may change the password.
  const claimed = await sql`
    UPDATE et_password_reset_tokens SET used_at = now() WHERE id = ${row.id} AND used_at IS NULL RETURNING id
  `
  if (!claimed[0]) return { error: "Линкът вече е използван." }

  await sql`UPDATE et_students SET password_hash = ${await hashPassword(password)}, updated_at = now() WHERE id = ${row.student_id}`
  await revokeAllStudentSessions(row.student_id)
  await sql`UPDATE et_recovery_requests SET status = 'resolved', resolved_at = now() WHERE student_id = ${row.student_id} AND status = 'pending'`
  return { success: "Паролата е сменена. Вече можеш да влезеш с новата парола." }
}

/* ---------------- Profile ---------------- */

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  let student
  try {
    student = await requireStudentAction()
  } catch {
    return { error: "Сесията е изтекла. Влез отново." }
  }
  const firstName = String(form.get("firstName") ?? "").trim()
  const lastName = String(form.get("lastName") ?? "").trim()
  const schoolGrade = String(form.get("schoolGrade") ?? "").trim() || null
  const ageGroup = String(form.get("ageGroup") ?? "").trim() || null
  const errors: Errors = {}
  const NAME = /^[\p{L}][\p{L}\s'’-]{0,49}$/u
  if (!NAME.test(firstName)) errors.firstName = "Въведете валидно име."
  if (!NAME.test(lastName)) errors.lastName = "Въведете валидна фамилия."
  if (schoolGrade && !SCHOOL_GRADES.includes(schoolGrade)) errors.schoolGrade = "Невалиден клас."
  if (ageGroup && !AGE_GROUPS.includes(ageGroup)) errors.ageGroup = "Невалидна възрастова група."
  if (Object.keys(errors).length) return { errors }

  await sql`
    UPDATE et_students SET first_name = ${firstName}, last_name = ${lastName}, school_grade = ${schoolGrade},
      age_group = ${ageGroup}, updated_at = now()
    WHERE id = ${student.id}
  `
  revalidatePath("/testove/dashboard", "layout")
  return { success: "Профилът е обновен." }
}

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  let student
  try {
    student = await requireStudentAction()
  } catch {
    return { error: "Сесията е изтекла. Влез отново." }
  }
  const current = String(form.get("currentPassword") ?? "")
  const password = String(form.get("password") ?? "")
  const confirm = String(form.get("confirmPassword") ?? "")
  const bucket = `password-change:${student.id}`
  if (await isRateLimited(bucket, 5, 900)) return { error: "Твърде много опити. Опитай по-късно." }

  const [row] = await sql`SELECT password_hash FROM et_students WHERE id = ${student.id}`
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    await recordRateLimitHit(bucket)
    return { errors: { currentPassword: "Текущата парола е грешна." } }
  }
  const passwordError = validatePassword(password, student.username)
  if (passwordError) return { errors: { password: passwordError } }
  if (password !== confirm) return { errors: { confirmPassword: "Паролите не съвпадат." } }

  await sql`UPDATE et_students SET password_hash = ${await hashPassword(password)}, updated_at = now() WHERE id = ${student.id}`
  await revokeAllStudentSessions(student.id)
  await createStudentSession(student.id)
  return { success: "Паролата е сменена." }
}

/* ---------------- Test attempts ---------------- */

export async function startTestAction(testId: number): Promise<{ error: string } | never> {
  let student
  try {
    student = await requireStudentAction()
  } catch {
    redirect(`/testove/vhod?next=${encodeURIComponent(`/testove/${testId}`)}`)
  }
  if (!Number.isInteger(testId) || testId <= 0) return { error: "Невалиден тест." }
  const result = await startAttempt(student.id, testId)
  if (!result.ok) return { error: result.error }
  redirect(`/testove/${testId}?attempt=${result.attemptId}`)
}

export async function saveAnswerAction(
  attemptId: string,
  attemptQuestionId: number,
  selectedOptionIds: number[],
  version: number,
): Promise<SaveAnswerResult> {
  try {
    const student = await requireStudentAction()
    if (!Array.isArray(selectedOptionIds) || selectedOptionIds.length > 20) return { ok: false, error: "Невалиден отговор." }
    const ids = selectedOptionIds.map(Number).filter(Number.isInteger)
    return await saveAnswer(student.id, attemptId, Number(attemptQuestionId), ids, Number(version))
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: "Сесията е изтекла. Влез отново.", closed: true }
    return { ok: false, error: GENERIC_ERROR }
  }
}

export async function submitAttemptAction(attemptId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const student = await requireStudentAction()
    if (!isUuid(attemptId)) return { ok: false, error: "Невалиден опит." }
    const result = await finalizeAttempt(attemptId, student.id)
    if (result.status === "not_found") return { ok: false, error: "Опитът не е намерен." }
    // "already_finalized" is success too: duplicate submissions are idempotent.
    const [owned] = await sql`SELECT 1 FROM et_attempts WHERE id = ${attemptId}::uuid AND student_id = ${student.id}`
    if (!owned) return { ok: false, error: "Опитът не е намерен." }
    revalidatePath("/testove/dashboard", "layout")
    return { ok: true }
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: "Сесията е изтекла. Влез отново." }
    return { ok: false, error: GENERIC_ERROR }
  }
}
