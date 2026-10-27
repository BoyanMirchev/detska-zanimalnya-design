"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

const AUTH_PATHS = ["/testove/vhod", "/testove/registracia", "/testove/zabravena-parola", "/testove/nova-parola"]

// The testing app (dashboard, test runner, results) has its own focused layout;
// the public /testove landing page keeps the marketing chrome, and auth pages can opt into the header.
export function SiteChromeGate({ children, showOnAuth = false }: { children: ReactNode; showOnAuth?: boolean }) {
  const pathname = usePathname()
  if (showOnAuth && AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return <>{children}</>
  if (pathname.startsWith("/testove/")) return null
  return <>{children}</>
}
