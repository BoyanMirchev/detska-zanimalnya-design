import { isAuthenticated } from "@/app/actions/admin"
import { sql } from "@/lib/db"
import { monthRange, todayISO } from "@/lib/dates"
import { getPaymentStatus, type PaymentStatus, type PaymentType } from "@/lib/payment-status"
import {
  ensureStudentsSchema,
  type ExportPayment,
  type Payment,
  type StudentDetail,
  type StudentRow,
} from "@/lib/students-db"

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
  }
}

/** Every read of student/payment data goes through this server-side session check. */
export async function requireAdmin() {
  if (!(await isAuthenticated())) throw new UnauthorizedError()
  await ensureStudentsSchema()
}

// Latest payment per type = the non-deleted record with the greatest period_to.
export async function getStudentRows(): Promise<StudentRow[]> {
  await requireAdmin()
  const rows = await sql`
    SELECT s.id, s.first_name, s.last_name, s.class, s.parent_name, s.parent_phone,
           s.parent_email, s.notes, s.active,
           t.amount::text AS tuition_amount, to_char(t.period_to, 'YYYY-MM-DD') AS tuition_to,
           c.amount::text AS catering_amount, to_char(c.period_to, 'YYYY-MM-DD') AS catering_to
    FROM students s
    LEFT JOIN LATERAL (
      SELECT amount, period_to FROM payments
      WHERE student_id = s.id AND type = 'TUITION' AND deleted_at IS NULL
      ORDER BY period_to DESC, payment_date DESC, id DESC LIMIT 1
    ) t ON true
    LEFT JOIN LATERAL (
      SELECT amount, period_to FROM payments
      WHERE student_id = s.id AND type = 'CATERING' AND deleted_at IS NULL
      ORDER BY period_to DESC, payment_date DESC, id DESC LIMIT 1
    ) c ON true
    ORDER BY s.active DESC, s.last_name, s.first_name
  `
  return rows as StudentRow[]
}

export async function getStudentDetail(id: number): Promise<StudentDetail | null> {
  await requireAdmin()
  const rows = await sql`
    SELECT s.id, s.first_name, s.last_name, s.class, s.parent_name, s.parent_phone,
           s.parent_email, s.notes, s.active,
           t.amount::text AS tuition_amount, to_char(t.period_to, 'YYYY-MM-DD') AS tuition_to,
           c.amount::text AS catering_amount, to_char(c.period_to, 'YYYY-MM-DD') AS catering_to,
           COALESCE((SELECT SUM(amount) FROM payments WHERE student_id = s.id AND type = 'TUITION' AND deleted_at IS NULL), 0)::text AS tuition_total,
           COALESCE((SELECT SUM(amount) FROM payments WHERE student_id = s.id AND type = 'CATERING' AND deleted_at IS NULL), 0)::text AS catering_total
    FROM students s
    LEFT JOIN LATERAL (
      SELECT amount, period_to FROM payments
      WHERE student_id = s.id AND type = 'TUITION' AND deleted_at IS NULL
      ORDER BY period_to DESC, payment_date DESC, id DESC LIMIT 1
    ) t ON true
    LEFT JOIN LATERAL (
      SELECT amount, period_to FROM payments
      WHERE student_id = s.id AND type = 'CATERING' AND deleted_at IS NULL
      ORDER BY period_to DESC, payment_date DESC, id DESC LIMIT 1
    ) c ON true
    WHERE s.id = ${id}
  `
  return (rows[0] as StudentDetail | undefined) ?? null
}

export async function getStudentPayments(studentId: number): Promise<Payment[]> {
  await requireAdmin()
  const rows = await sql`
    SELECT id, student_id, type, amount::text AS amount,
           to_char(payment_date, 'YYYY-MM-DD') AS payment_date,
           to_char(period_from, 'YYYY-MM-DD') AS period_from,
           to_char(period_to, 'YYYY-MM-DD') AS period_to,
           payment_method, notes
    FROM payments
    WHERE student_id = ${studentId} AND deleted_at IS NULL
    ORDER BY payment_date DESC, created_at DESC, id DESC
  `
  return rows as Payment[]
}

export type AttentionItem = {
  studentId: number
  studentName: string
  className: string
  type: PaymentType
  status: Exclude<PaymentStatus, "paid">
  paidUntil: string | null
}

export type PaymentsOverview = {
  activeStudents: number
  paid: number
  overdue: number
  expiring: number
  revenueThisMonth: string
  attention: AttentionItem[]
}

const ATTENTION_ORDER: Record<AttentionItem["status"], number> = { overdue: 0, expiring: 1, none: 2 }

export async function getPaymentsOverview(): Promise<PaymentsOverview> {
  await requireAdmin()
  const today = todayISO()
  const { start, next } = monthRange(Number(today.slice(0, 4)), Number(today.slice(5, 7)))
  const [rows, revenue] = await Promise.all([
    getStudentRows(),
    sql`
      SELECT COALESCE(SUM(amount), 0)::text AS total FROM payments
      WHERE deleted_at IS NULL AND payment_date >= ${start} AND payment_date < ${next}
    `,
  ])

  const active = rows.filter((r) => r.active)
  let paid = 0
  let overdue = 0
  let expiring = 0
  const attention: AttentionItem[] = []

  for (const r of active) {
    const tuition = getPaymentStatus(r.tuition_to, today)
    const catering = getPaymentStatus(r.catering_to, today)
    if (tuition === "overdue" || catering === "overdue") overdue++
    else if (tuition !== "none") paid++
    if (tuition === "expiring" || catering === "expiring") expiring++

    const name = `${r.first_name} ${r.last_name}`
    if (tuition !== "paid")
      attention.push({ studentId: r.id, studentName: name, className: r.class, type: "TUITION", status: tuition, paidUntil: r.tuition_to })
    if (catering !== "paid")
      attention.push({ studentId: r.id, studentName: name, className: r.class, type: "CATERING", status: catering, paidUntil: r.catering_to })
  }

  attention.sort(
    (a, b) =>
      ATTENTION_ORDER[a.status] - ATTENTION_ORDER[b.status] ||
      (a.paidUntil ?? "").localeCompare(b.paidUntil ?? "") ||
      a.studentName.localeCompare(b.studentName, "bg"),
  )

  return {
    activeStudents: active.length,
    paid,
    overdue,
    expiring,
    revenueThisMonth: (revenue[0] as { total: string }).total,
    attention,
  }
}

export type MonthlyReport = {
  tuitionTotal: string
  tuitionCount: number
  cateringTotal: string
  cateringCount: number
  total: string
  count: number
}

// Revenue is attributed by payment_date (when the money was received), never by period.
export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  await requireAdmin()
  const { start, next } = monthRange(year, month)
  const rows = await sql`
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE type = 'TUITION'), 0)::text AS tuition_total,
      COUNT(*) FILTER (WHERE type = 'TUITION')::int AS tuition_count,
      COALESCE(SUM(amount) FILTER (WHERE type = 'CATERING'), 0)::text AS catering_total,
      COUNT(*) FILTER (WHERE type = 'CATERING')::int AS catering_count,
      COALESCE(SUM(amount), 0)::text AS total,
      COUNT(*)::int AS count
    FROM payments
    WHERE deleted_at IS NULL AND payment_date >= ${start} AND payment_date < ${next}
  `
  const r = rows[0] as Record<string, string | number>
  return {
    tuitionTotal: String(r.tuition_total),
    tuitionCount: Number(r.tuition_count),
    cateringTotal: String(r.catering_total),
    cateringCount: Number(r.catering_count),
    total: String(r.total),
    count: Number(r.count),
  }
}

export async function getMonthlyPayments(year: number, month: number): Promise<ExportPayment[]> {
  await requireAdmin()
  const { start, next } = monthRange(year, month)
  const rows = await sql`
    SELECT p.id, p.student_id, p.type, p.amount::text AS amount,
           to_char(p.payment_date, 'YYYY-MM-DD') AS payment_date,
           to_char(p.period_from, 'YYYY-MM-DD') AS period_from,
           to_char(p.period_to, 'YYYY-MM-DD') AS period_to,
           p.payment_method, p.notes,
           s.first_name || ' ' || s.last_name AS student_name, s.parent_name
    FROM payments p
    JOIN students s ON s.id = p.student_id
    WHERE p.deleted_at IS NULL AND p.payment_date >= ${start} AND p.payment_date < ${next}
    ORDER BY p.payment_date DESC, p.id DESC
  `
  return rows as ExportPayment[]
}
