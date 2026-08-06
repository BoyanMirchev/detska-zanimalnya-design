"use server"

import { sql } from "@/lib/db"

export type RegistrationFormState = {
  success?: boolean
  error?: string
}

export async function submitRegistration(
  _prevState: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const name = String(formData.get("name") || "").trim()
  const childName = String(formData.get("childName") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const ageGroup = String(formData.get("ageGroup") || "").trim()
  const school = String(formData.get("school") || "").trim()
  const shift = String(formData.get("shift") || "").trim()
  const otherNote = String(formData.get("otherNote") || "").trim()
  const services = formData.getAll("services").map((s) => String(s))
  const newsletter = String(formData.get("newsletter") || "")

  if (!name || !email || !phone) {
    return { error: "Моля, попълнете име, имейл и телефон." }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    return { error: "Моля, въведете валиден имейл адрес." }
  }

  const newsletterBool = newsletter === "yes" ? true : newsletter === "no" ? false : null

  try {
    await sql`
      INSERT INTO contact_requests
        (name, email, phone, source, child_name, age_group, services, school, shift, other_note, newsletter, image_paths)
      VALUES (
        ${name}, ${email}, ${phone}, 'registration',
        ${childName || null}, ${ageGroup || null}, ${JSON.stringify(services)}::jsonb,
        ${school || null}, ${shift || null}, ${otherNote || null}, ${newsletterBool}, '[]'::jsonb
      )
    `
    return { success: true }
  } catch (err) {
    console.log("[v0] submitRegistration error:", err)
    return { error: "Възникна грешка. Моля, опитайте отново." }
  }
}
