import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

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
