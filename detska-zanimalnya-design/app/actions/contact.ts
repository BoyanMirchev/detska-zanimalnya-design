"use server"

import { sql } from "@/lib/db"

export type ContactFormState = {
  success?: boolean
  error?: string
}

export async function submitContactRequest(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const childAge = String(formData.get("childAge") || "").trim()
  const message = String(formData.get("message") || "").trim()

  // Uploaded image pathnames are passed as a JSON string from the client.
  let imagePaths: string[] = []
  try {
    const raw = String(formData.get("imagePaths") || "[]")
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      imagePaths = parsed.filter((p): p is string => typeof p === "string").slice(0, 6)
    }
  } catch {
    imagePaths = []
  }

  if (!name || !email || !message) {
    return { error: "Моля, попълнете име, имейл и съобщение." }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    return { error: "Моля, въведете валиден имейл адрес." }
  }

  try {
    await sql`
      INSERT INTO contact_requests (name, email, phone, child_age, message, image_paths)
      VALUES (${name}, ${email}, ${phone || null}, ${childAge || null}, ${message}, ${JSON.stringify(imagePaths)}::jsonb)
    `
    return { success: true }
  } catch (err) {
    console.log("[v0] submitContactRequest error:", err)
    return { error: "Възникна грешка. Моля, опитайте отново." }
  }
}
