import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/app/actions/admin"

const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const file = (await request.formData()).get("file")
    if (!(file instanceof File)) return NextResponse.json({ error: "Няма прикачен файл." }, { status: 400 })
    const ext = ALLOWED[file.type]
    if (!ext) return NextResponse.json({ error: "Разрешени са JPG, PNG и WebP изображения." }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Файлът е твърде голям (макс. 8 MB)." }, { status: 400 })

    const blob = await put(`workshops/workshop.${ext}`, file, { access: "private", addRandomSuffix: true })
    return NextResponse.json({ url: `/api/workshop-image?pathname=${encodeURIComponent(blob.pathname)}` })
  } catch (error) {
    console.log("[v0] workshop upload error:", error)
    return NextResponse.json({ error: "Качването се провали." }, { status: 500 })
  }
}
