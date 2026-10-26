import Link from "next/link"
import { requireAdminPage } from "@/lib/english-tests/auth"
import { PAGE_SIZE, listCategories, listLevels, listQuestions } from "@/lib/english-tests/admin-data"
import { LABELS, QUESTION_STATUSES } from "@/lib/english-tests/types"
import { EtShell, Pagination } from "@/components/admin/english-tests/et-shell"
import { QuestionBank } from "@/components/admin/english-tests/question-bank"
import { inputClass, primaryButton, secondaryButton } from "@/components/admin/ui"

export const dynamic = "force-dynamic"

type Search = Record<string, string | undefined>
const num = (v?: string) => (v && /^\d+$/.test(v) ? Number(v) : undefined)

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdminPage()
  const sp = await searchParams
  const filters = {
    q: sp.q?.slice(0, 100),
    level: num(sp.level),
    category: num(sp.category),
    difficulty: undefined,
    status: sp.status === "all" || QUESTION_STATUSES.includes(sp.status as never) ? sp.status : undefined,
    sort: ["updated", "level", "points", "text"].includes(sp.sort ?? "") ? sp.sort : "updated",
    page: num(sp.page) ?? 1,
  }
  const [result, levels, categories] = await Promise.all([listQuestions(filters), listLevels(), listCategories()])

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(Object.entries({ ...sp, page: String(page) }).filter(([, v]) => v) as [string, string][])
    return `/admin/english-tests/questions?${params}`
  }

  return (
    <EtShell
      title="Банка с въпроси"
      subtitle="Създавайте, редактирайте и организирайте въпросите по ниво и категория."
      actions={
        <Link href="/admin/english-tests/questions/new" className="inline-flex items-center rounded-full bg-[#DD5B26] px-6 py-3 font-extrabold text-white shadow-sm transition hover:-translate-y-0.5">
          Нов въпрос
        </Link>
      }
    >
      <form method="get" className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6" role="search">
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-xs font-extrabold text-[#17324D]/60">Търсене</span>
          <input name="q" defaultValue={filters.q} placeholder="Текст на въпроса" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">Ниво</span>
          <select name="level" defaultValue={filters.level ?? ""} className={inputClass}>
            <option value="">Всички</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">Категория</span>
          <select name="category" defaultValue={filters.category ?? ""} className={inputClass}>
            <option value="">Всички</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">Статус</span>
          <select name="status" defaultValue={filters.status ?? ""} className={inputClass}>
            <option value="">Без архивирани</option>
            <option value="all">Всички</option>
            {QUESTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LABELS.questionStatus[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-[#17324D]/60">Подредба</span>
          <select name="sort" defaultValue={filters.sort} className={inputClass}>
            <option value="updated">Последно променени</option>
            <option value="level">По ниво</option>
            <option value="points">По точки</option>
            <option value="text">По текст</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5 lg:justify-end">
          <Link href="/admin/english-tests/questions" className={secondaryButton}>
            Изчисти
          </Link>
          <button type="submit" className={primaryButton}>
            Филтрирай
          </button>
        </div>
      </form>

      <QuestionBank rows={result.rows} />
      <Pagination page={result.page} total={result.total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />
    </EtShell>
  )
}
