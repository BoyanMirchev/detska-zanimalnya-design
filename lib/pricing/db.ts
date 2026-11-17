import "server-only"
import { cache } from "react"
import { unstable_cache } from "next/cache"
import { sql } from "@/lib/db"
import { PRICE_SEED } from "@/lib/pricing/seed"
import type { PriceGroup, PriceRecord } from "@/lib/pricing/types"
import { ensureWorkshopsSchema } from "@/lib/workshops/db"

export const PRICES_TAG = "prices"

let schemaReady: Promise<void> | null = null

/**
 * Idempotent migration (same on-demand pattern as the other tables): creates
 * the pricing tables, imports the formerly hardcoded prices once, and links
 * every workshop to its own price record. Safe to rerun at any time.
 */
export function ensurePricingSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await ensureWorkshopsSchema()
      await sql`
        CREATE TABLE IF NOT EXISTS price_groups (
          key text PRIMARY KEY CHECK (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
          service_name text NOT NULL,
          category text NOT NULL,
          page_path text NOT NULL CHECK (page_path LIKE '/%'),
          title text NOT NULL DEFAULT '',
          note text,
          sort_order integer NOT NULL DEFAULT 0,
          workshop_id integer UNIQUE REFERENCES workshops(id) ON DELETE CASCADE,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS prices (
          id serial PRIMARY KEY,
          key text NOT NULL UNIQUE CHECK (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
          group_key text NOT NULL REFERENCES price_groups(key) ON UPDATE CASCADE ON DELETE CASCADE,
          label text NOT NULL,
          note text,
          display_mode text NOT NULL DEFAULT 'amount'
            CHECK (display_mode IN ('amount', 'free', 'on_request', 'coming_soon')),
          currency text NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'BGN')),
          regular_price numeric(10, 2) CHECK (regular_price >= 0),
          regular_price_bgn numeric(10, 2) CHECK (regular_price_bgn >= 0),
          promotional_price numeric(10, 2) CHECK (promotional_price >= 0),
          promotional_price_bgn numeric(10, 2) CHECK (promotional_price_bgn >= 0),
          promotion_enabled boolean NOT NULL DEFAULT false,
          promotion_starts_on date,
          promotion_ends_on date,
          billing_period text,
          installments integer CHECK (installments BETWEEN 2 AND 24),
          is_visible boolean NOT NULL DEFAULT true,
          sort_order integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          CHECK (display_mode <> 'amount' OR regular_price IS NOT NULL),
          CHECK (promotion_starts_on IS NULL OR promotion_ends_on IS NULL OR promotion_starts_on <= promotion_ends_on)
        )
      `
      await sql`CREATE INDEX IF NOT EXISTS prices_group_idx ON prices (group_key, sort_order, id)`
      await sql`
        CREATE TABLE IF NOT EXISTS price_history (
          id serial PRIMARY KEY,
          price_id integer REFERENCES prices(id) ON DELETE SET NULL,
          entity text NOT NULL CHECK (entity IN ('price', 'group')),
          entity_key text NOT NULL,
          entity_label text NOT NULL,
          changed_by text NOT NULL,
          changes jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `
      await sql`CREATE INDEX IF NOT EXISTS price_history_created_idx ON price_history (created_at DESC)`

      for (const [gi, g] of PRICE_SEED.entries()) {
        await sql`
          INSERT INTO price_groups (key, service_name, category, page_path, title, note, sort_order)
          VALUES (${g.key}, ${g.service_name}, ${g.category}, ${g.page_path}, ${g.title}, ${g.note ?? null}, ${gi * 10})
          ON CONFLICT (key) DO NOTHING
        `
        for (const [ri, r] of g.rows.entries()) {
          await sql`
            INSERT INTO prices (key, group_key, label, note, display_mode, regular_price, regular_price_bgn, installments, sort_order)
            VALUES (${r.key}, ${g.key}, ${r.label}, ${r.note ?? null}, 'amount', ${r.regular}, ${r.bgn ?? null}, ${r.installments ?? null}, ${ri})
            ON CONFLICT (key) DO NOTHING
          `
        }
      }
      await syncWorkshopPrices()
    })().catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

/**
 * Every workshop (existing or created later) gets exactly one linked price record,
 * so workshops use the same central pricing instead of a separate system.
 * The legacy workshops.price value is copied only when the record is first created.
 */
export async function syncWorkshopPrices(): Promise<void> {
  await sql`
    INSERT INTO price_groups (key, service_name, category, page_path, title, sort_order, workshop_id)
    SELECT 'workshop-' || id, title, 'Работилници', '/rabotilnici/' || slug, title, 1000 + sort_order, id
    FROM workshops
    ON CONFLICT (key) DO UPDATE SET
      service_name = EXCLUDED.service_name,
      page_path = EXCLUDED.page_path,
      title = EXCLUDED.title,
      sort_order = EXCLUDED.sort_order
  `
  await sql`
    INSERT INTO prices (key, group_key, label, display_mode, regular_price)
    SELECT 'workshop-' || id, 'workshop-' || id, 'Цена за работилница',
      CASE WHEN price IS NULL THEN 'coming_soon' WHEN price = 0 THEN 'free' ELSE 'amount' END,
      CASE WHEN price > 0 THEN price END
    FROM workshops
    ON CONFLICT (key) DO NOTHING
  `
}

const PRICE_COLUMNS = sql.unsafe(`
  id, key, group_key, label, note, display_mode, currency,
  regular_price::text AS regular_price, regular_price_bgn::text AS regular_price_bgn,
  promotional_price::text AS promotional_price, promotional_price_bgn::text AS promotional_price_bgn,
  promotion_enabled, promotion_starts_on::text AS promotion_starts_on, promotion_ends_on::text AS promotion_ends_on,
  billing_period, installments, is_visible, sort_order, updated_at::text AS updated_at
`)

const GROUP_COLUMNS = sql.unsafe(`
  key, service_name, category, page_path, title, note, sort_order, updated_at::text AS updated_at
`)

export type PriceData = { groups: PriceGroup[]; prices: PriceRecord[] }

async function loadPriceData(visibleOnly: boolean): Promise<PriceData> {
  await ensurePricingSchema()
  const [groups, prices] = await Promise.all([
    sql`SELECT ${GROUP_COLUMNS} FROM price_groups ORDER BY sort_order, key`,
    visibleOnly
      ? sql`SELECT ${PRICE_COLUMNS} FROM prices WHERE is_visible ORDER BY group_key, sort_order, id`
      : sql`SELECT ${PRICE_COLUMNS} FROM prices ORDER BY group_key, sort_order, id`,
  ])
  return { groups: groups as PriceGroup[], prices: prices as PriceRecord[] }
}

/**
 * Public price data: one small query pair shared by every page, cached under the
 * "prices" tag and expired immediately when an admin saves (see pricing-admin actions).
 * Promotions are evaluated at render time, so the hourly revalidation also rolls
 * date-based promotions over without a deployment.
 */
const getCachedPublicPriceData = unstable_cache(() => loadPriceData(true), ["public-price-data-v1"], {
  tags: [PRICES_TAG],
  revalidate: 3600,
})

export const getPublicPriceData = cache(getCachedPublicPriceData)

export async function getPriceGroup(groupKey: string): Promise<{ group: PriceGroup; prices: PriceRecord[] } | null> {
  const data = await getPublicPriceData()
  const group = data.groups.find((g) => g.key === groupKey)
  if (!group) return null
  return { group, prices: data.prices.filter((p) => p.group_key === groupKey) }
}

export async function getPricesByCategory(category: string): Promise<PriceData> {
  const data = await getPublicPriceData()
  const groups = data.groups.filter((g) => g.category === category)
  const keys = new Set(groups.map((g) => g.key))
  return { groups, prices: data.prices.filter((p) => keys.has(p.group_key)) }
}

export async function getPrice(key: string): Promise<PriceRecord | null> {
  const data = await getPublicPriceData()
  return data.prices.find((p) => p.key === key) ?? null
}

export function workshopPriceKey(workshopId: number): string {
  return `workshop-${workshopId}`
}

/* ---------- Admin (uncached, always fresh) ---------- */

export function getAdminPriceData(): Promise<PriceData> {
  return loadPriceData(false)
}

export async function getAdminPriceById(id: number): Promise<PriceRecord | null> {
  await ensurePricingSchema()
  const rows = await sql`SELECT ${PRICE_COLUMNS} FROM prices WHERE id = ${id}`
  return (rows[0] as PriceRecord | undefined) ?? null
}

export async function getAdminGroupByKey(key: string): Promise<(PriceGroup & { workshop_id: number | null }) | null> {
  await ensurePricingSchema()
  const rows = await sql`SELECT ${GROUP_COLUMNS}, workshop_id FROM price_groups WHERE key = ${key}`
  return (rows[0] as (PriceGroup & { workshop_id: number | null }) | undefined) ?? null
}

export type PriceChange = { field: string; from: string | null; to: string | null }

export type PriceHistoryEntry = {
  id: number
  entity: "price" | "group"
  entity_key: string
  entity_label: string
  changed_by: string
  changes: PriceChange[]
  created_at: string
  service_name: string | null
  page_path: string | null
}

export async function getPriceHistory(limit = 300): Promise<PriceHistoryEntry[]> {
  await ensurePricingSchema()
  const rows = await sql`
    SELECT h.id, h.entity, h.entity_key, h.entity_label, h.changed_by, h.changes, h.created_at::text AS created_at,
           g.service_name, g.page_path
    FROM price_history h
    LEFT JOIN prices p ON p.id = h.price_id
    LEFT JOIN price_groups g ON g.key = COALESCE(p.group_key, CASE WHEN h.entity = 'group' THEN h.entity_key END)
    ORDER BY h.created_at DESC, h.id DESC
    LIMIT ${limit}
  `
  return rows as PriceHistoryEntry[]
}
