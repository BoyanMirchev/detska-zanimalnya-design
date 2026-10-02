import { sql } from "@/lib/db"
import type { PaymentMethod, PaymentType } from "@/lib/payment-status"

let schemaReady: Promise<void> | null = null

/**
 * Idempotent migration for the students/payments tables, following the same
 * on-demand pattern as ensureContactSchema. Payments are append-only records;
 * corrections are audited and deletions are soft (deleted_at).
 */
export function ensureStudentsSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS students (
          id serial PRIMARY KEY,
          first_name text NOT NULL,
          last_name text NOT NULL,
          class text NOT NULL,
          parent_name text NOT NULL,
          parent_phone text NOT NULL,
          parent_email text,
          notes text,
          active boolean NOT NULL DEFAULT true,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS payments (
          id serial PRIMARY KEY,
          student_id integer NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
          type text NOT NULL CHECK (type IN ('TUITION', 'CATERING')),
          amount numeric(12, 2) NOT NULL CHECK (amount > 0),
          payment_date date NOT NULL,
          period_from date NOT NULL,
          period_to date NOT NULL,
          payment_method text NOT NULL CHECK (payment_method IN ('CASH', 'BANK', 'CARD', 'OTHER')),
          notes text,
          created_by text,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          deleted_at timestamptz,
          deleted_by text,
          CONSTRAINT payments_period_check CHECK (period_to >= period_from)
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS payments_student_type_period_idx
        ON payments (student_id, type, period_to DESC) WHERE deleted_at IS NULL
      `
      await sql`
        CREATE INDEX IF NOT EXISTS payments_payment_date_idx
        ON payments (payment_date) WHERE deleted_at IS NULL
      `
      await sql`
        CREATE TABLE IF NOT EXISTS payment_audit (
          id serial PRIMARY KEY,
          payment_id integer NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
          action text NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
          snapshot jsonb NOT NULL,
          created_by text,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `
    })().catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

export type Student = {
  id: number
  first_name: string
  last_name: string
  class: string
  parent_name: string
  parent_phone: string
  parent_email: string | null
  notes: string | null
  active: boolean
}

/** A student with the latest (max period_to) payment per type. Dates are YYYY-MM-DD strings, amounts exact decimal strings. */
export type StudentRow = Student & {
  tuition_amount: string | null
  tuition_to: string | null
  catering_amount: string | null
  catering_to: string | null
}

export type StudentDetail = StudentRow & {
  tuition_total: string
  catering_total: string
}

export type Payment = {
  id: number
  student_id: number
  type: PaymentType
  amount: string
  payment_date: string
  period_from: string
  period_to: string
  payment_method: PaymentMethod
  notes: string | null
}

export type ExportPayment = Payment & {
  student_name: string
  parent_name: string
}
