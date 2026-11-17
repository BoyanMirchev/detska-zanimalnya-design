import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

// Public proxy for workshop images stored in the private Blob store.
// Strictly limited to the workshops/ prefix so no other private files are exposed.
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname") ?? ""
  if (!/^workshops\/[A-Za-z0-9._-]+$/.test(pathname)) {
    return new NextResponse("Not found", { status: 404 })
  }

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    })
    if (!result) return new NextResponse("Not found", { status: 404 })

    const headers = {
      ETag: result.blob.etag,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    }
    if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers })

    return new NextResponse(result.stream, {
      headers: { ...headers, "Content-Type": result.blob.contentType, "X-Content-Type-Options": "nosniff" },
    })
  } catch (error) {
    console.log("[v0] workshop image error:", error)
    return new NextResponse("Failed to load image", { status: 500 })
  }
}
