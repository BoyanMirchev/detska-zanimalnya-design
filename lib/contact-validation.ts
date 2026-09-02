// Shared contact-form validation used by BOTH the client dialog (for live UX)
// and the server action (as the authoritative check). Keep these pure so they
// can run in either environment without side effects.

export type ContactFields = {
  name: string
  email: string
  phone: string
  childAge: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>

/** Remove all whitespace so "+359 888 123 456" validates like "+359888123456". */
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "")
}

export function validateName(value: string): string | undefined {
  if (value.trim().length < 2) {
    return "Моля, въведете вашето име (поне 2 символа)."
  }
  return undefined
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim()
  // Requires a non-empty local part, an "@", a domain, a dot, and a TLD.
  // Rejects: "test", "test@", "@gmail.com", "test@gmail".
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return "Моля, въведете валиден имейл адрес."
  }
  return undefined
}

export function validatePhone(value: string): string | undefined {
  const v = normalizePhone(value)
  // Required field.
  if (!v) {
    return "Моля, въведете вашия телефонен номер."
  }
  // Bulgarian formats: 0XXXXXXXXX (10 digits) or +359XXXXXXXXX.
  if (!/^(0\d{9}|\+359\d{9})$/.test(v)) {
    return "Моля, въведете валиден телефонен номер."
  }
  return undefined
}

export function validateChildAge(value: string): string | undefined {
  const v = value.trim()
  // Whole numbers only — reject decimals, negatives, and text.
  if (!/^\d+$/.test(v)) {
    return "Възрастта на детето трябва да бъде между 6 и 14 години."
  }
  const n = Number(v)
  if (!Number.isInteger(n) || n < 6 || n > 14) {
    return "Възрастта на детето трябва да бъде между 6 и 14 години."
  }
  return undefined
}

export function validateMessage(value: string): string | undefined {
  if (value.trim().length < 10) {
    return "Моля, въведете съобщение (поне 10 символа)."
  }
  return undefined
}

/** Full validation pass. Returns only the fields that currently have an error. */
export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {}

  const name = validateName(fields.name)
  if (name) errors.name = name

  const email = validateEmail(fields.email)
  if (email) errors.email = email

  const phone = validatePhone(fields.phone)
  if (phone) errors.phone = phone

  const childAge = validateChildAge(fields.childAge)
  if (childAge) errors.childAge = childAge

  const message = validateMessage(fields.message)
  if (message) errors.message = message

  return errors
}

/** Convenience for the submit-button enabled state. */
export function isContactValid(fields: ContactFields): boolean {
  return Object.keys(validateContact(fields)).length === 0
}
