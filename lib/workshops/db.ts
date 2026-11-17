import "server-only"
import { sql } from "@/lib/db"
import { WORKSHOP_SEEDS } from "@/lib/workshops/seed"
import type { Workshop, WorkshopRegistration } from "@/lib/workshops/types"

let schemaReady: Promise<void> | null = null

/**
 * Idempotent on-demand migration (same pattern as ensureContactSchema).
 * `reserved_count` holds the number of non-cancelled registrations and is only
 * changed inside single atomic statements, so capacity is enforced safely
 * even under concurrent registrations.
 */
export function ensureWorkshopsSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS workshops (
          id serial PRIMARY KEY,
          slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
          season text NOT NULL DEFAULT '',
          title text NOT NULL,
          short_description text NOT NULL DEFAULT '',
          hero_title text NOT NULL DEFAULT '',
          hero_subtitle text NOT NULL DEFAULT '',
          about text NOT NULL DEFAULT '',
          activities jsonb NOT NULL DEFAULT '[]'::jsonb,
          materials_title text NOT NULL DEFAULT 'С какво ще творим?',
          materials jsonb NOT NULL DEFAULT '[]'::jsonb,
          take_home jsonb NOT NULL DEFAULT '[]'::jsonb,
          notices jsonb NOT NULL DEFAULT '[]'::jsonb,
          image_url text NOT NULL DEFAULT '',
          image_alt text NOT NULL DEFAULT '',
          seo_title text,
          seo_description text,
          requires_allergy_info boolean NOT NULL DEFAULT false,
          event_date date,
          start_time time,
          duration_minutes integer CHECK (duration_minutes > 0),
          age_min integer CHECK (age_min >= 0),
          age_max integer CHECK (age_max >= 0),
          price numeric(10, 2) CHECK (price >= 0),
          capacity integer CHECK (capacity >= 0),
          reserved_count integer NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
          registration_enabled boolean NOT NULL DEFAULT true,
          published boolean NOT NULL DEFAULT true,
          sort_order integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS workshop_registrations (
          id serial PRIMARY KEY,
          workshop_id integer NOT NULL REFERENCES workshops(id) ON DELETE RESTRICT,
          parent_name text NOT NULL,
          phone text NOT NULL,
          email text NOT NULL,
          child_name text NOT NULL,
          child_age integer NOT NULL CHECK (child_age BETWEEN 1 AND 18),
          has_allergies boolean,
          allergy_details text,
          notes text,
          status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'cancelled')),
          consent_at timestamptz NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS workshop_registrations_dedupe_idx
        ON workshop_registrations (workshop_id, lower(email), lower(child_name))
        WHERE status <> 'cancelled'
      `
      await sql`
        CREATE INDEX IF NOT EXISTS workshop_registrations_workshop_idx
        ON workshop_registrations (workshop_id, created_at DESC)
      `
      for (const s of WORKSHOP_SEEDS) {
        await sql`
          INSERT INTO workshops (
            slug, season, title, short_description, hero_title, hero_subtitle, about,
            activities, materials_title, materials, take_home, notices,
            image_url, image_alt, seo_title, seo_description, requires_allergy_info, sort_order
          ) VALUES (
            ${s.slug}, ${s.season}, ${s.title}, ${s.short_description}, ${s.hero_title}, ${s.hero_subtitle}, ${s.about},
            ${JSON.stringify(s.activities)}::jsonb, ${s.materials_title}, ${JSON.stringify(s.materials)}::jsonb,
            ${JSON.stringify(s.take_home)}::jsonb, ${JSON.stringify(s.notices)}::jsonb,
            ${s.image_url}, ${s.image_alt}, ${s.seo_title}, ${s.seo_description}, ${s.requires_allergy_info}, ${s.sort_order}
          )
          ON CONFLICT (slug) DO NOTHING
        `
      }
    })().catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

const WORKSHOP_COLUMNS = sql.unsafe(`
  id, slug, season, title, short_description, hero_title, hero_subtitle, about,
  activities, materials_title, materials, take_home, notices, image_url, image_alt,
  seo_title, seo_description, requires_allergy_info,
  event_date::text AS event_date, to_char(start_time, 'HH24:MI') AS start_time,
  duration_minutes, age_min, age_max, price::text AS price, capacity, reserved_count,
  registration_enabled, published, sort_order
`)

export async function getPublishedWorkshops(): Promise<Workshop[]> {
  await ensureWorkshopsSchema()
  const rows = await sql`
    SELECT ${WORKSHOP_COLUMNS} FROM workshops
    WHERE published ORDER BY sort_order, id
  `
  return rows as Workshop[]
}

export async function getPublishedWorkshop(slug: string): Promise<Workshop | null> {
  await ensureWorkshopsSchema()
  const rows = await sql`SELECT ${WORKSHOP_COLUMNS} FROM workshops WHERE slug = ${slug} AND published`
  return (rows[0] as Workshop | undefined) ?? null
}

export type AdminWorkshopRow = Workshop & { new_count: number; confirmed_count: number; cancelled_count: number }

export async function getAllWorkshopsWithCounts(): Promise<AdminWorkshopRow[]> {
  await ensureWorkshopsSchema()
  const rows = await sql`
    SELECT ${WORKSHOP_COLUMNS},
      (SELECT count(*)::int FROM workshop_registrations r WHERE r.workshop_id = workshops.id AND r.status = 'new') AS new_count,
      (SELECT count(*)::int FROM workshop_registrations r WHERE r.workshop_id = workshops.id AND r.status = 'confirmed') AS confirmed_count,
      (SELECT count(*)::int FROM workshop_registrations r WHERE r.workshop_id = workshops.id AND r.status = 'cancelled') AS cancelled_count
    FROM workshops ORDER BY sort_order, id
  `
  return rows as AdminWorkshopRow[]
}

export async function getWorkshopById(id: number): Promise<Workshop | null> {
  await ensureWorkshopsSchema()
  const rows = await sql`SELECT ${WORKSHOP_COLUMNS} FROM workshops WHERE id = ${id}`
  return (rows[0] as Workshop | undefined) ?? null
}

export async function getWorkshopRegistrations(workshopId: number): Promise<WorkshopRegistration[]> {
  await ensureWorkshopsSchema()
  const rows = await sql`
    SELECT id, workshop_id, parent_name, phone, email, child_name, child_age, has_allergies,
           allergy_details, notes, status, consent_at::text AS consent_at, created_at::text AS created_at
    FROM workshop_registrations
    WHERE workshop_id = ${workshopId}
    ORDER BY created_at DESC
  `
  return rows as WorkshopRegistration[]
}
