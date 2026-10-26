import { NextResponse, type NextRequest } from "next/server"
import { AuthError } from "@/lib/english-tests/auth"
import { listResults } from "@/lib/english-tests/admin-data"

export const dynamic = "force-dynamic"

/** Escapes a CSV cell and neutralises spreadsheet formula injection. */
function cell(value: unknown) {
  let s = value === null || value === undefined ? "" : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

const num = (v: string | null) => (v !== null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined)

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  try {
    const { rows } = await listResults(
      {
        student: sp.get("student") ?? undefined,
        test: num(sp.get("test")),
        level: sp.get("level") ?? undefined,
        from: sp.get("from") ?? undefined,
        to: sp.get("to") ?? undefined,
        minScore: num(sp.get("min")),
        maxScore: num(sp.get("max")),
      },
      { all: true },
    )
    const header = ["Ученик", "Потребител", "Тест", "Опит", "Статус", "Започнат", "Предаден", "Верни", "Общо въпроси", "Точки", "Макс. точки", "Процент", "Ниво"]
    const lines = rows.map((r) =>
      [
        r.studentName,
        r.username,
        r.testTitle,
        r.attemptNumber,
        r.status === "expired" ? "Изтекло време" : "Предаден",
        r.startedAt,
        r.submittedAt,
        r.correct,
        r.total,
        r.score,
        r.maxScore,
        r.percentage,
        r.level ?? (r.testType === "placement" ? "Неустановено" : ""),
      ]
        .map(cell)
        .join(","),
    )
    const body = "\uFEFF" + [header.map(cell).join(","), ...lines].join("\r\n")
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="english-test-results-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    if (error instanceof AuthError) return new NextResponse("Unauthorized", { status: 401 })
    throw error
  }
}
