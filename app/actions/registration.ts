"use server"

import { sql, ensureContactSchema } from "@/lib/db"
import { validateRegistration } from "@/lib/registration-validation"

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

  // Authoritative server-side validation — mirrors the client rules and rejects
  // invalid requests even if the client checks are bypassed. Notes and
  // newsletter are intentionally excluded (optional fields).
  const errors = validateRegistration({
    name,
    childName,
    email,
    phone,
    ageGroup,
    school,
    shift,
    services,
    otherNote,
    newsletter,
  })
  const firstError =
    errors.name ||
    errors.childName ||
    errors.email ||
    errors.phone ||
    errors.ageGroup ||
    errors.school ||
    errors.shift ||
    errors.services
  if (firstError) {
    return { error: firstError }
  }

  const newsletterBool = newsletter === "yes" ? true : newsletter === "no" ? false : null

  try {
    await ensureContactSchema()
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
