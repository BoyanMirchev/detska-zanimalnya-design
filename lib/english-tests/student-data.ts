import "server-only"
import { sql } from "@/lib/db"
import { ensureEnglishTestsSchema } from "./schema"
import { finalizeExpiredAttempts, getEligibility, isTestOpen, isUuid, type Eligibility, type TestRow } from "./engine"
import { parseSettings } from "./validation"
import type { AttemptStatus, GradingSnapshot, OptionSnapshot, PlacementRuleConfig, QuestionSnapshot } from "./types"
import type { PlacementOutcome } from "./grading"

export type AvailableTest = {
  id: number
  title: string
  description: string
  testType: "level" | "placement"
  levelName: string | null
  durationMinutes: number
  questionCount: number
  eligibility: Eligibility
}

export async function getActiveLevelNames(): Promise<string[]> {
  await ensureEnglishTestsSchema()
  const rows = await sql`
    SELECT name FROM et_levels WHERE is_active AND archived_at IS NULL ORDER BY display_order, id
  `
  return rows.map((row) => String(row.name))
}

export async function getAvailableTests(studentId: number): Promise<AvailableTest[]> {
  await ensureEnglishTestsSchema()
  await finalizeExpiredAttempts({ studentId })
  const rows = (await sql`
    SELECT t.*, l.name AS level_name FROM et_tests t
    LEFT JOIN et_levels l ON l.id = t.level_id
    WHERE t.status = 'published'
      AND (t.available_from IS NULL OR t.available_from <= now())
      AND (t.available_until IS NULL OR t.available_until > now())
    ORDER BY t.test_type DESC, t.created_at DESC
  `) as (TestRow & { level_name: string | null })[]

  return Promise.all(
    rows.map(async (t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      testType: t.test_type,
      levelName: t.level_name,
      durationMinutes: t.duration_minutes,
      questionCount: t.question_count,
      eligibility: await getEligibility(studentId, t),
    })),
  )
}

export type TestIntro = AvailableTest & { open: boolean; instructions: { allowBack: boolean; allowAnswerChange: boolean } }

export async function getTestIntro(studentId: number, testId: number): Promise<TestIntro | null> {
  if (!Number.isInteger(testId) || testId <= 0) return null
  await ensureEnglishTestsSchema()
  await finalizeExpiredAttempts({ studentId })
  const [t] = (await sql`
    SELECT t.*, l.name AS level_name FROM et_tests t LEFT JOIN et_levels l ON l.id = t.level_id WHERE t.id = ${testId}
  `) as (TestRow & { level_name: string | null })[]
  // Drafts and archived tests are indistinguishable from missing ones for students.
  if (!t || (t.status !== "published" && t.status !== "unpublished")) return null
  const settings = parseSettings(t.settings)
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    testType: t.test_type,
    levelName: t.level_name,
    durationMinutes: t.duration_minutes,
    questionCount: t.question_count,
    eligibility: await getEligibility(studentId, t),
    open: isTestOpen(t),
    instructions: { allowBack: settings.allowBack, allowAnswerChange: settings.allowAnswerChange },
  }
}

export type AttemptSummary = {
  id: string
  testId: number
  testTitle: string
  testType: "level" | "placement"
  attemptNumber: number
  status: AttemptStatus
  startedAt: string
  submittedAt: string | null
  correct: number | null
  total: number
  score: number | null
  maxScore: number | null
  percentage: number | null
  estimatedLevel: string | null
  conclusive: boolean | null
  showScore: boolean
  showLevel: boolean
}

function toSummary(r: Record<string, any>): AttemptSummary {
  const settings = parseSettings(r.settings_snapshot)
  return {
    id: r.id,
    testId: r.test_id,
    testTitle: r.test_title,
    testType: r.test_type,
    attemptNumber: r.attempt_number,
    status: r.status,
    startedAt: new Date(r.started_at).toISOString(),
    submittedAt: r.submitted_at ? new Date(r.submitted_at).toISOString() : null,
    correct: r.correct_count,
    total: r.total_questions,
    score: r.score,
    maxScore: r.max_score,
    percentage: r.percentage === null ? null : Number(r.percentage),
    estimatedLevel: r.estimated_level,
    conclusive: r.placement_conclusive,
    showScore: settings.showScore,
    showLevel: settings.showLevel,
  }
}

export async function getStudentAttempts(studentId: number): Promise<AttemptSummary[]> {
  await ensureEnglishTestsSchema()
  await finalizeExpiredAttempts({ studentId })
  const rows = await sql`
    SELECT id, test_id, test_title, test_type, attempt_number, status, started_at, submitted_at, correct_count,
           total_questions, score, max_score, percentage, estimated_level, placement_conclusive, settings_snapshot
    FROM et_attempts WHERE student_id = ${studentId}
    ORDER BY started_at DESC
  `
  return rows.map(toSummary)
}

export type ResultDetail = AttemptSummary & {
  answered: number
  incorrect: number
  unanswered: number
  placement: PlacementOutcome | null
  canRetake: boolean
  review:
    | {
        order: number
        text: string
        options: (OptionSnapshot & { correct: boolean; selected: boolean })[]
        isCorrect: boolean
        explanation: string | null
      }[]
    | null
}

/** Ownership is enforced in SQL: a student can only ever load their own finalised attempt. */
export async function getStudentResult(studentId: number, attemptId: string): Promise<ResultDetail | null> {
  if (!isUuid(attemptId)) return null
  await ensureEnglishTestsSchema()
  await finalizeExpiredAttempts({ studentId })
  const [r] = await sql`
    SELECT a.*, t.status AS test_status, t.available_from, t.available_until, t.settings AS test_settings,
           t.id AS t_id, t.title, t.description, t.test_type AS t_type, t.level_id, t.duration_minutes,
           t.question_count, t.selection_method, t.selection_config
    FROM et_attempts a JOIN et_tests t ON t.id = a.test_id
    WHERE a.id = ${attemptId}::uuid AND a.student_id = ${studentId} AND a.status IN ('submitted', 'expired')
  `
  if (!r) return null
  const summary = toSummary(r)
  const settings = parseSettings(r.settings_snapshot)

  let review: ResultDetail["review"] = null
  if (settings.showCorrectAnswers) {
    const rows = await sql`
      SELECT aq.display_order, aq.question_snapshot, aq.options_snapshot, aq.grading_snapshot, aq.is_correct,
             coalesce(sa.selected_option_ids, '[]'::jsonb) AS selected
      FROM et_attempt_questions aq
      LEFT JOIN et_student_answers sa ON sa.attempt_question_id = aq.id
      WHERE aq.attempt_id = ${attemptId}::uuid ORDER BY aq.display_order
    `
    review = rows.map((q) => {
      const grading = q.grading_snapshot as GradingSnapshot
      const selected = new Set<number>(q.selected)
      return {
        order: q.display_order,
        text: (q.question_snapshot as QuestionSnapshot).text,
        isCorrect: Boolean(q.is_correct),
        explanation: grading.explanation,
        options: (q.options_snapshot as OptionSnapshot[]).map((o) => ({
          ...o,
          correct: grading.correctOptionIds.includes(o.id),
          selected: selected.has(o.id),
        })),
      }
    })
  }

  const eligibility = await getEligibility(studentId, {
    id: r.t_id,
    title: r.title,
    description: r.description,
    test_type: r.t_type,
    level_id: r.level_id,
    duration_minutes: r.duration_minutes,
    question_count: r.question_count,
    selection_method: r.selection_method,
    selection_config: r.selection_config,
    status: r.test_status,
    settings: r.test_settings,
    available_from: r.available_from,
    available_until: r.available_until,
  })

  return {
    ...summary,
    answered: r.answered_count ?? 0,
    incorrect: r.incorrect_count ?? 0,
    unanswered: r.unanswered_count ?? 0,
    placement: settings.showLevel ? ((r.placement_details as PlacementOutcome) ?? null) : null,
    canRetake: eligibility.canStart && !eligibility.activeAttemptId,
    review,
  }
}

export type { PlacementRuleConfig }
