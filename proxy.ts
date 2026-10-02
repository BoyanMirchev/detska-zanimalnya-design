import { NextResponse, type NextRequest } from "next/server"

// Defense in depth only: every protected page, server action and route also verifies the session itself.
function expectedSession() {
  if (!process.env.ADMIN_PASSWORD) return null
  // Must match Buffer.from(value).toString("base64") in app/actions/admin.ts, including non-ASCII passwords.
  const bytes = new TextEncoder().encode(`admin:${process.env.ADMIN_PASSWORD}`)
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
}

export function proxy(req: NextRequest) {
  const expected = expectedSession()
  const authed = expected !== null && req.cookies.get("admin_session")?.value === expected
  if (authed) return NextResponse.next()

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.redirect(new URL("/admin", req.url))
}

export const config = {
  matcher: ["/admin/students/:path*", "/admin/payments/:path*", "/api/admin/:path*"],
}
