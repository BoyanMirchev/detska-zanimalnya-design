"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

// The testing app (dashboard, test runner, results, auth) has its own focused layout;
// only the public /testove landing page keeps the marketing header and footer.
export function SiteChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith("/testove/")) return null
  return <>{children}</>
}
