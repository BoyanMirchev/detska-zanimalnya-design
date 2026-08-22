import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Meta Conversions API graph endpoint version.
const GRAPH_API_VERSION = "v23.0"

// Only events this app is allowed to forward server-side.
const ALLOWED_EVENT_NAMES = new Set(["Contact"])

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip") ?? undefined
}

export async function POST(request: NextRequest) {
  // Both values stay server-side only; they are never sent to the browser.
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    console.error("[v0] Meta CAPI skipped: META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is missing")
    return NextResponse.json({ ok: false, reason: "not_configured" })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 })
  }

  const eventName = typeof body.eventName === "string" ? body.eventName : "Contact"
  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : ""

  if (!ALLOWED_EVENT_NAMES.has(eventName)) {
    return NextResponse.json({ ok: false, reason: "event_not_allowed" }, { status: 400 })
  }

  if (!eventId || eventId.length > 100) {
    return NextResponse.json({ ok: false, reason: "invalid_event_id" }, { status: 400 })
  }

  const rawSourceUrl = typeof body.eventSourceUrl === "string" ? body.eventSourceUrl : ""
  const eventSourceUrl = /^https?:\/\//i.test(rawSourceUrl)
    ? rawSourceUrl
    : (request.headers.get("referer") ?? undefined)

  // Only real, server-observable signals - no invented customer data.
  const userData: Record<string, string> = {}
  const fbp = request.cookies.get("_fbp")?.value
  const fbc = request.cookies.get("_fbc")?.value
  const clientIp = getClientIp(request)
  const userAgent = request.headers.get("user-agent")

  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc
  if (clientIp) userData.client_ip_address = clientIp
  if (userAgent) userData.client_user_agent = userAgent

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        // Same id as the browser Pixel call -> Meta deduplicates the two copies.
        event_id: eventId,
        action_source: "website",
        ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
        user_data: userData,
      },
    ],
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: accessToken }),
      cache: "no-store",
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error("[v0] Meta CAPI rejected the event:", response.status, detail)
      return NextResponse.json({ ok: false, reason: "capi_error" })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Meta CAPI request failed:", error)
    return NextResponse.json({ ok: false, reason: "request_failed" })
  }
}
