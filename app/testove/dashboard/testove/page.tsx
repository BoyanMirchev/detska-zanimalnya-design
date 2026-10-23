import { requireStudent } from "@/lib/english-tests/auth"
import { getAvailableTests } from "@/lib/english-tests/student-data"
import { TestCard } from "@/components/testove/test-card"
import { Panel } from "@/components/testove/ui"

export default async function AvailableTestsPage() {
  const student = await requireStudent("/testove/dashboard/testove")
  const tests = await getAvailableTests(student.id)
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Налични тестове</h1>
      {tests.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map((t) => (
            <TestCard key={t.id} test={t} />
          ))}
        </div>
      ) : (
        <Panel>
          <p className="font-bold text-et-navy/70">В момента няма публикувани тестове.</p>
        </Panel>
      )}
    </>
  )
}
