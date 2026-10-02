import { NextResponse, type NextRequest } from "next/server"
import { formatDateBG } from "@/lib/dates"
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@/lib/payment-status"
import { getMonthlyPayments, UnauthorizedError } from "@/lib/students-data"

export const dynamic = "force-dynamic"

function csvCell(value: string) {
  // Prefix formula-like values so spreadsheets never execute them.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(req: NextRequest) {
  const year = Number(req.nextUrl.searchParams.get("year"))
  const month = Number(req.nextUrl.searchParams.get("month"))
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid month or year" }, { status: 400 })
  }

  try {
    const payments = await getMonthlyPayments(year, month)
    const header = ["Ученик", "Родител", "Тип", "Сума", "Дата на плащане", "Период от", "Период до", "Метод"]
    const lines = payments.map((p) =>
      [
        p.student_name,
        p.parent_name,
        PAYMENT_TYPE_LABELS[p.type],
        p.amount,
        formatDateBG(p.payment_date),
        formatDateBG(p.period_from),
        formatDateBG(p.period_to),
        PAYMENT_METHOD_LABELS[p.payment_method],
      ]
        .map(csvCell)
        .join(","),
    )
    // BOM so Excel opens the Cyrillic text as UTF-8.
    const body = "\uFEFF" + [header.map(csvCell).join(","), ...lines].join("\r\n")
    const filename = `plashtania-${year}-${String(month).padStart(2, "0")}.csv`
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    console.error("[admin/payments/export] failed", err)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
