import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

let schemaReady: Promise<void> | null = null

/**
 * Idempotently ensures the contact_requests table and all its columns exist.
 * Safe to call on every request — the work only runs once per server instance,
 * and the SQL itself is guarded with IF NOT EXISTS so it works on any branch/DB.
 */
export function ensureContactSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS contact_requests (
          id serial PRIMARY KEY,
          name text NOT NULL,
          email text NOT NULL,
          phone text,
          child_age text,
          message text,
          status text NOT NULL DEFAULT 'new',
          created_at timestamptz NOT NULL DEFAULT now(),
          image_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
          source text DEFAULT 'message',
          child_name text,
          age_group text,
          services jsonb DEFAULT '[]'::jsonb,
          school text,
          shift text,
          other_note text,
          newsletter boolean
        )
      `
      // Backfill any columns that may be missing on older tables.
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS source text DEFAULT 'message'`
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS child_name text`
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS age_group text`
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS services jsonb DEFAULT '[]'::jsonb`
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS school text`
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS shift text`
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS other_note text`
      await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS newsletter boolean`
      await sql`ALTER TABLE contact_requests ALTER COLUMN message DROP NOT NULL`
    })().catch((err) => {
      // Reset so a later request can retry if this failed.
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

export type ContactRequest = {
  id: number
  name: string
  email: string
  phone: string | null
  child_age: string | null
  message: string | null
  status: string
  created_at: string
  image_paths: string[]
  source: string | null
  child_name: string | null
  age_group: string | null
  services: string[] | null
  school: string | null
  shift: string | null
  other_note: string | null
  newsletter: boolean | null
}
