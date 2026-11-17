"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { getPublishedWorkshop } from "@/lib/workshops/db"
import { AVAILABILITY_MESSAGES, getAvailability } from "@/lib/workshops/types"
import {
  MAX_NOTES_LENGTH,
  validateWorkshopRegistration,
  type WorkshopRegistrationErrors,
} from "@/lib/workshops/validation"

export type WorkshopRegistrationState = {
  success?: boolean
  error?: string
  fieldErrors?: WorkshopRegistrationErrors
  workshopTitle?: string
}

// Bots typically submit instantly; humans need a few seconds to fill the form.
const MIN_FILL_TIME_MS = 3000

export async function submitWorkshopRegistration(
  _prev: WorkshopRegistrationState,
  formData: FormData,
): Promise<WorkshopRegistrationState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim()

  const honeypot = get("company")
  const startedAt = Number(get("startedAt"))
  if (honeypot || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_TIME_MS) {
    return { error: "Заявката не можа да бъде изпратена. Моля, опитайте отново." }
  }

  const fields = {
    parentName: get("parentName").replace(/\s+/g, " "),
    phone: get("phone"),
    email: get("email").toLowerCase(),
    childName: get("childName").replace(/\s+/g, " "),
    childAge: get("childAge"),
    workshop: get("workshop"),
    hasAllergies: get("hasAllergies"),
    allergyDetails: get("allergyDetails").slice(0, 500),
    consent: formData.get("consent") === "on",
  }
  const notes = get("notes").slice(0, MAX_NOTES_LENGTH)

  try {
    const workshop = await getPublishedWorkshop(fields.workshop)
    if (!workshop) return { error: "Избраната работилница не е намерена.", fieldErrors: { workshop: "Моля, изберете работилница." } }

    const fieldErrors = validateWorkshopRegistration(fields, { requiresAllergyInfo: workshop.requires_allergy_info })
    if (Object.keys(fieldErrors).length > 0) {
      return { error: "Моля, проверете маркираните полета.", fieldErrors }
    }

    const availability = getAvailability(workshop)
    if (availability.state !== "open") return { error: AVAILABILITY_MESSAGES[availability.state] + "." }

    const hasAllergies = workshop.requires_allergy_info ? fields.hasAllergies === "yes" : null
    const allergyDetails = hasAllergies ? fields.allergyDetails : null

    // Reserve a place and insert the registration in ONE statement: the guarded
    // UPDATE row-locks the workshop, so concurrent requests cannot overbook.
    const inserted = await sql`
      WITH slot AS (
        UPDATE workshops
        SET reserved_count = reserved_count + 1, updated_at = now()
        WHERE id = ${workshop.id}
          AND published
          AND registration_enabled
          AND (capacity IS NULL OR reserved_count < capacity)
          AND (event_date IS NULL OR event_date >= (now() AT TIME ZONE 'Europe/Sofia')::date)
        RETURNING id
      )
      INSERT INTO workshop_registrations
        (workshop_id, parent_name, phone, email, child_name, child_age, has_allergies, allergy_details, notes, consent_at)
      SELECT slot.id, ${fields.parentName}, ${fields.phone}, ${fields.email}, ${fields.childName},
             ${Number(fields.childAge)}, ${hasAllergies}, ${allergyDetails}, ${notes || null}, now()
      FROM slot
      RETURNING id
    `
    if (inserted.length === 0) {
      return { error: "Местата за тази работилница току-що бяха запълнени или записването е затворено." }
    }

    revalidatePath(`/rabotilnici/${workshop.slug}`)
    revalidatePath("/rabotilnici")
    return { success: true, workshopTitle: workshop.title }
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { error: "Вече имаме заявка за това дете с този имейл за избраната работилница." }
    }
    console.log("[v0] submitWorkshopRegistration error:", err)
    return { error: "Възникна грешка. Моля, опитайте отново или ни се обадете." }
  }
}
