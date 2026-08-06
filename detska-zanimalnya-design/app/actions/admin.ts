"use server"

import { sql, type ContactRequest } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const COOKIE_NAME = "admin_session"

function sessionValue() {
  // Derive an opaque token from the password so the raw password is never stored in the cookie.
  return Buffer.from(`admin:${process.env.ADMIN_PASSWORD}`).toString("base64")
}

export async function isAuthenticated() {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === sessionValue()
}

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") || "")
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD не е конфигуриран." }
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Грешна парола." }
  }
  const store = await cookies()
  store.set(COOKIE_NAME, sessionValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  redirect("/admin")
}

export async function logout() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
  redirect("/admin")
}

export async function getContactRequests(): Promise<ContactRequest[]> {
  if (!(await isAuthenticated())) throw new Error("Unauthorized")
  const rows = await sql`
    SELECT id, name, email, phone, child_age, message, status, created_at,
           source, child_name, age_group, services, school, shift, other_note, newsletter
    FROM contact_requests
    ORDER BY created_at DESC
  `
  return rows as ContactRequest[]
}

export async function updateStatus(id: number, status: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized")
  await sql`UPDATE contact_requests SET status = ${status} WHERE id = ${id}`
  revalidatePath("/admin")
}

export async function deleteRequest(id: number) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized")
  await sql`DELETE FROM contact_requests WHERE id = ${id}`
  revalidatePath("/admin")
}
