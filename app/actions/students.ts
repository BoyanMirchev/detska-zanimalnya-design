"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { PAYMENT_TYPES, type PaymentType } from "@/lib/payment-status"
import { requireAdmin, UnauthorizedError } from "@/lib/students-data"
import { validatePayment, validateStudent, type FieldErrors } from "@/lib/student-validation"

export type ActionResult = { ok: true; id?: number } | { ok: false; error: string; fieldErrors?: FieldErrors }

const ADMIN_ACTOR = "admin"

function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0
}

async function guarded(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    await requireAdmin()
    return await fn()
  } catch (err) {
    if (err instanceof UnauthorizedError) return { ok: false, error: "Нямате достъп. Влезте отново в админ панела." }
    console.error("[admin/students] action failed", err)
    return { ok: false, error: "Възникна грешка при записа. Опитайте отново." }
  }
}

function revalidateStudent(id?: number) {
  revalidatePath("/admin")
  revalidatePath("/admin/students")
  revalidatePath("/admin/payments")
  if (id) revalidatePath(`/admin/students/${id}`)
}

export async function createStudent(input: Record<string, unknown>): Promise<ActionResult> {
  return guarded(async () => {
    const { data, errors } = validateStudent(input)
    if (!data) return { ok: false, error: "Моля, поправете грешките във формата.", fieldErrors: errors }
    const rows = await sql`
      INSERT INTO students (first_name, last_name, class, parent_name, parent_phone, parent_email, notes, active)
      VALUES (${data.firstName}, ${data.lastName}, ${data.className}, ${data.parentName},
              ${data.parentPhone}, ${data.parentEmail}, ${data.notes}, ${data.active})
      RETURNING id
    `
    const id = (rows[0] as { id: number }).id
    revalidateStudent(id)
    return { ok: true, id }
  })
}

export async function updateStudent(id: number, input: Record<string, unknown>): Promise<ActionResult> {
  return guarded(async () => {
    if (!isId(id)) return { ok: false, error: "Невалиден ученик." }
    const { data, errors } = validateStudent(input)
    if (!data) return { ok: false, error: "Моля, поправете грешките във формата.", fieldErrors: errors }
    const rows = await sql`
      UPDATE students SET
        first_name = ${data.firstName}, last_name = ${data.lastName}, class = ${data.className},
        parent_name = ${data.parentName}, parent_phone = ${data.parentPhone},
        parent_email = ${data.parentEmail}, notes = ${data.notes}, active = ${data.active},
        updated_at = now()
      WHERE id = ${id}
      RETURNING id
    `
    if (rows.length === 0) return { ok: false, error: "Ученикът не е намерен." }
    revalidateStudent(id)
    return { ok: true, id }
  })
}

export async function deleteStudent(id: number): Promise<ActionResult> {
  return guarded(async () => {
    if (!isId(id)) return { ok: false, error: "Невалиден ученик." }
    const existing = await sql`SELECT id FROM students WHERE id = ${id}`
    if (existing.length === 0) return { ok: false, error: "Ученикът не е намерен." }
    await sql.transaction([
      sql`DELETE FROM payment_audit WHERE payment_id IN (SELECT id FROM payments WHERE student_id = ${id})`,
      sql`DELETE FROM payments WHERE student_id = ${id}`,
      sql`DELETE FROM students WHERE id = ${id}`,
    ])
    revalidateStudent(id)
    return { ok: true, id }
  })
}

export async function addPayment(
  studentId: number,
  type: PaymentType,
  input: Record<string, unknown>,
): Promise<ActionResult> {
  return guarded(async () => {
    if (!isId(studentId)) return { ok: false, error: "Невалиден ученик." }
    if (!PAYMENT_TYPES.includes(type)) return { ok: false, error: "Невалиден тип плащане." }
    const { data, errors } = validatePayment(input)
    if (!data) return { ok: false, error: "Моля, поправете грешките във формата.", fieldErrors: errors }

    const student = await sql`SELECT id FROM students WHERE id = ${studentId}`
    if (student.length === 0) return { ok: false, error: "Ученикът не е намерен." }

    const rows = await sql`
      INSERT INTO payments (student_id, type, amount, payment_date, period_from, period_to, payment_method, notes, created_by)
      VALUES (${studentId}, ${type}, ${data.amount}::numeric, ${data.paymentDate}::date, ${data.periodFrom}::date,
              ${data.periodTo}::date, ${data.method}, ${data.notes}, ${ADMIN_ACTOR})
      RETURNING id
    `
    const id = (rows[0] as { id: number }).id
    await sql`
      INSERT INTO payment_audit (payment_id, action, snapshot, created_by)
      SELECT id, 'CREATE', to_jsonb(p), ${ADMIN_ACTOR} FROM payments p WHERE id = ${id}
    `
    revalidateStudent(studentId)
    return { ok: true, id }
  })
}

export async function updatePayment(paymentId: number, input: Record<string, unknown>): Promise<ActionResult> {
  return guarded(async () => {
    if (!isId(paymentId)) return { ok: false, error: "Невалидно плащане." }
    const { data, errors } = validatePayment(input)
    if (!data) return { ok: false, error: "Моля, поправете грешките във формата.", fieldErrors: errors }

    const existing = await sql`SELECT student_id FROM payments WHERE id = ${paymentId} AND deleted_at IS NULL`
    if (existing.length === 0) return { ok: false, error: "Плащането не е намерено." }
    const studentId = (existing[0] as { student_id: number }).student_id

    // Keep the previous version so corrections never silently erase financial history.
    await sql`
      INSERT INTO payment_audit (payment_id, action, snapshot, created_by)
      SELECT id, 'UPDATE', to_jsonb(p), ${ADMIN_ACTOR} FROM payments p WHERE id = ${paymentId}
    `
    await sql`
      UPDATE payments SET
        amount = ${data.amount}::numeric, payment_date = ${data.paymentDate}::date,
        period_from = ${data.periodFrom}::date, period_to = ${data.periodTo}::date,
        payment_method = ${data.method}, notes = ${data.notes}, updated_at = now()
      WHERE id = ${paymentId}
    `
    revalidateStudent(studentId)
    return { ok: true, id: paymentId }
  })
}

export async function deletePayment(paymentId: number): Promise<ActionResult> {
  return guarded(async () => {
    if (!isId(paymentId)) return { ok: false, error: "Невалидно плащане." }
    const rows = await sql`
      UPDATE payments SET deleted_at = now(), deleted_by = ${ADMIN_ACTOR}, updated_at = now()
      WHERE id = ${paymentId} AND deleted_at IS NULL
      RETURNING student_id
    `
    if (rows.length === 0) return { ok: false, error: "Плащането не е намерено." }
    await sql`
      INSERT INTO payment_audit (payment_id, action, snapshot, created_by)
      SELECT id, 'DELETE', to_jsonb(p), ${ADMIN_ACTOR} FROM payments p WHERE id = ${paymentId}
    `
    const studentId = (rows[0] as { student_id: number }).student_id
    revalidateStudent(studentId)
    return { ok: true, id: paymentId }
  })
}
