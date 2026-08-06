"use client"

import { usePathname } from "next/navigation"
import { RegistrationForm } from "@/components/registration-form"

export function RegistrationSection() {
  const pathname = usePathname()
  // Hide the public registration form on the admin dashboard.
  if (pathname?.startsWith("/admin")) return null
  return <RegistrationForm />
}
