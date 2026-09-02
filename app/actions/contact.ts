"use server"

import { sql, ensureContactSchema } from "@/lib/db"
import { validateContact } from "@/lib/contact-validation"

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

  // Authoritative server-side validation — never trust the client alone.
  const errors = validateContact({ name, email, phone, childAge, message })
  const firstError = errors.name || errors.email || errors.phone || errors.childAge || errors.message
  if (firstError) {
    return { error: firstError }
  }

  try {
    await ensureContactSchema()
    await sql`
      INSERT INTO contact_requests (name, email, phone, child_age, message, image_paths)
      VALUES (${name}, ${email}, ${phone || null}, ${childAge || null}, ${message}, '[]'::jsonb)
    `
    return { success: true }
  } catch (err) {
    console.log("[v0] submitContactRequest error:", err)
    return { error: "Възникна грешка. Моля, опитайте отново." }
  }
}
