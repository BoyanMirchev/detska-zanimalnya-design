// Shared workshop-registration validation used by the client form (live UX)
// and the server action (authoritative). Pure functions only.
import { validateEmail, validateParentName, validatePhone } from "@/lib/registration-validation"

export type WorkshopRegistrationFields = {
  parentName: string
  phone: string
  email: string
  childName: string
  childAge: string
  workshop: string
  hasAllergies: string
  allergyDetails: string
  consent: boolean
}

export type WorkshopRegistrationErrorKey =
  | "parentName"
  | "phone"
  | "email"
  | "childName"
  | "childAge"
  | "workshop"
  | "hasAllergies"
  | "allergyDetails"
  | "consent"

export type WorkshopRegistrationErrors = Partial<Record<WorkshopRegistrationErrorKey, string>>

export const MAX_NOTES_LENGTH = 1000

export function validateWorkshopChildName(value: string): string | undefined {
  const v = value.trim().replace(/\s+/g, " ")
  if (v.length < 2 || v.length > 80 || !/^[\p{L}\s-]+$/u.test(v)) return "Моля, въведете името на детето."
  return undefined
}

export function validateChildAge(value: string): string | undefined {
  if (!/^\d{1,2}$/.test(value.trim())) return "Моля, въведете възрастта на детето."
  const n = Number(value)
  if (n < 1 || n > 18) return "Моля, въведете възраст между 1 и 18 години."
  return undefined
}

export function validateWorkshopRegistration(
  fields: WorkshopRegistrationFields,
  { requiresAllergyInfo }: { requiresAllergyInfo: boolean },
): WorkshopRegistrationErrors {
  const errors: WorkshopRegistrationErrors = {}
  const set = (key: WorkshopRegistrationErrorKey, msg: string | undefined) => {
    if (msg) errors[key] = msg
  }

  set("parentName", validateParentName(fields.parentName))
  set("phone", validatePhone(fields.phone))
  set("email", validateEmail(fields.email))
  set("childName", validateWorkshopChildName(fields.childName))
  set("childAge", validateChildAge(fields.childAge))
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.workshop)) errors.workshop = "Моля, изберете работилница."

  if (requiresAllergyInfo) {
    if (fields.hasAllergies !== "yes" && fields.hasAllergies !== "no") {
      errors.hasAllergies = "Моля, отговорете дали детето има хранителни алергии или непоносимости."
    } else if (fields.hasAllergies === "yes" && fields.allergyDetails.trim().length < 2) {
      errors.allergyDetails = "Моля, опишете алергиите или непоносимостите."
    }
  }

  if (!fields.consent) errors.consent = "Необходимо е съгласие за обработка на личните данни."
  return errors
}
