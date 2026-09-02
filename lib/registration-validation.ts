// Shared enrollment/registration validation used by BOTH the client form (for
// live UX) and the server action (as the authoritative check). Keep these pure
// so they run identically in either environment without side effects.

export const ageGroups = [
  "Предучилищна група (5-7 год.)",
  "1 – 4 клас",
  "5 – 7 клас",
  "над 8 клас",
] as const

export const services = [
  "Курсовете ни",
  "3-те занимални",
  "Роботика и Програмиране за деца",
  "Курс по чужди езици",
  "Шахмат за деца",
  "Курс по БЕЛ и Математика",
  "Предприемачество и Бизнес финанси",
  "Етикеция и добри обноски",
  "Лятно училище",
  "Друго",
] as const

export const shifts = ["Първа смяна", "Втора смяна", "Целодневна"] as const

export type RegistrationFields = {
  name: string
  childName: string
  email: string
  phone: string
  ageGroup: string
  school: string
  shift: string
  services: string[]
  // Optional fields below — never affect validity.
  otherNote: string
  newsletter: string
}

// Only the fields that can carry a validation error (optional fields excluded).
export type RegistrationErrorKey =
  | "name"
  | "childName"
  | "email"
  | "phone"
  | "ageGroup"
  | "school"
  | "shift"
  | "services"

export type RegistrationErrors = Partial<Record<RegistrationErrorKey, string>>

/** Collapse runs of whitespace and trim the ends. */
function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, " ")
}

/** Remove all whitespace so "+359 888 123 456" validates like "+359888123456". */
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "")
}

/**
 * Full name: at least 2 meaningful characters, at least two words, and only
 * letters (Bulgarian Cyrillic + Latin), spaces and hyphens. Reject digits,
 * symbols and whitespace-only values.
 */
function validateFullName(value: string, message: string): string | undefined {
  const v = normalizeSpaces(value)
  if (v.length < 2) return message
  if (!/^[\p{L}\s-]+$/u.test(v)) return message
  const words = v.split(" ").filter((w) => w.replace(/-/g, "").length > 0)
  if (words.length < 2) return message
  return undefined
}

export function validateParentName(value: string): string | undefined {
  return validateFullName(value, "Моля, въведете име и фамилия на родителя.")
}

export function validateChildName(value: string): string | undefined {
  return validateFullName(value, "Моля, въведете име и фамилия на детето.")
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim()
  // Non-empty local part, "@", domain, dot, TLD. Rejects "test", "test@",
  // "@gmail.com", "test@gmail", and any address containing whitespace.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return "Моля, въведете валиден имейл адрес."
  }
  return undefined
}

export function validatePhone(value: string): string | undefined {
  const v = normalizePhone(value)
  // Bulgarian formats: 0XXXXXXXXX (10 digits) or +359XXXXXXXXX.
  if (!/^(0\d{9}|\+359\d{9})$/.test(v)) {
    return "Моля, въведете валиден телефонен номер."
  }
  return undefined
}

export function validateAgeGroup(value: string): string | undefined {
  if (!(ageGroups as readonly string[]).includes(value.trim())) {
    return "Моля, изберете възрастова група."
  }
  return undefined
}

export function validateSchool(value: string): string | undefined {
  if (value.trim().length < 2) {
    return "Моля, въведете училище."
  }
  return undefined
}

export function validateShift(value: string): string | undefined {
  if (!(shifts as readonly string[]).includes(value.trim())) {
    return "Моля, изберете смяна."
  }
  return undefined
}

export function validateServices(value: string[]): string | undefined {
  const valid = value.filter((s) => (services as readonly string[]).includes(s))
  if (valid.length < 1) {
    return "Моля, изберете поне една услуга."
  }
  return undefined
}

/** Full validation pass. Returns only the fields that currently have an error. */
export function validateRegistration(fields: RegistrationFields): RegistrationErrors {
  const errors: RegistrationErrors = {}

  const name = validateParentName(fields.name)
  if (name) errors.name = name

  const childName = validateChildName(fields.childName)
  if (childName) errors.childName = childName

  const email = validateEmail(fields.email)
  if (email) errors.email = email

  const phone = validatePhone(fields.phone)
  if (phone) errors.phone = phone

  const ageGroup = validateAgeGroup(fields.ageGroup)
  if (ageGroup) errors.ageGroup = ageGroup

  const school = validateSchool(fields.school)
  if (school) errors.school = school

  const shift = validateShift(fields.shift)
  if (shift) errors.shift = shift

  const servicesError = validateServices(fields.services)
  if (servicesError) errors.services = servicesError

  return errors
}

/** Convenience for the submit-button enabled state. */
export function isRegistrationValid(fields: RegistrationFields): boolean {
  return Object.keys(validateRegistration(fields)).length === 0
}
