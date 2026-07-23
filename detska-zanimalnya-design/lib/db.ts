import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

export type ContactRequest = {
  id: number
  name: string
  email: string
  phone: string | null
  child_age: string | null
  message: string
  status: string
  created_at: string
}
