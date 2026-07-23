import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

const MAX_SIZE = 8 * 1024 * 1024 // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Няма прикачен файл." }, { status: 400 })
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Разрешени са само изображения." }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Файлът е твърде голям (макс. 8 MB)." }, { status: 400 })
    }

    // Store in a dedicated folder with a randomized suffix to avoid collisions.
    const blob = await put(`contact-uploads/${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
    })

    // Never return the private URL to the client — only the pathname.
    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.log("[v0] upload error:", error)
    return NextResponse.json({ error: "Качването се провали." }, { status: 500 })
  }
}
