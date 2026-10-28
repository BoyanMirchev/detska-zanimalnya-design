import "server-only"
import { randomUUID } from "node:crypto"
import { sql } from "@/lib/db"
import { ensureEnglishTestsSchema } from "./schema"
import { estimatePlacement, gradeAttempt, type GradableQuestion } from "./grading"
import { selectRandomQuestions, shuffle, type PoolQuestion } from "./selection"
import { parseSelectionConfig, parseSettings } from "./validation"
import type {
  AttemptStatus,
  GradingSnapshot,
  OptionSnapshot,
  PlacementRuleConfig,
  QuestionSnapshot,
  TestSettings,
} from "./types"

/* ------------------------------------------------------------------ */
/* Availability & eligibility                                          */
/* ------------------------------------------------------------------ */

export type TestRow = {
  id: number
  title: string
  description: string
  test_type: "level" | "placement"
  level_id: number | null
  duration_minutes: number
  question_count: number
  selection_method: "manual" | "random"
  selection_config: unknown
  status: string
  settings: unknown
  available_from: string | null
  available_until: string | null
}

export function isTestOpen(test: Pick<TestRow, "status" | "available_from" | "available_until">, now = new Date()) {
  if (test.status !== "published") return false
  if (test.available_from && new Date(test.available_from) > now) return false
  if (test.available_until && new Date(test.available_until) <= now) return false
  return true
}

export type Eligibility = {
  canStart: boolean
  reason: string | null
  attemptsUsed: number
  attemptsAllowed: number | null
  nextAvailableAt: string | null
  activeAttemptId: string | null
}

export async function getEligibility(studentId: number, test: TestRow): Promise<Eligibility> {
  const settings = parseSettings(test.settings)
  const [usage] = await sql`
    SELECT
      (SELECT count(*)::int FROM et_attempts WHERE student_id = ${studentId} AND test_id = ${test.id} AND status IN ('submitted', 'expired')) AS used,
      (SELECT max(submitted_at) FROM et_attempts WHERE student_id = ${studentId} AND test_id = ${test.id} AND status IN ('submitted', 'expired')) AS last_submitted,
      (SELECT coalesce(sum(extra_attempts), 0)::int FROM et_retake_grants WHERE student_id = ${studentId} AND test_id = ${test.id}) AS extra,
      (SELECT max(created_at) FROM et_retake_grants WHERE student_id = ${studentId} AND test_id = ${test.id}) AS last_grant,
      (SELECT id FROM et_attempts WHERE student_id = ${studentId} AND test_id = ${test.id} AND status IN ('in_progress', 'grading') LIMIT 1) AS active_id
  `
  const attemptsAllowed = settings.maxAttempts === 0 ? null : settings.maxAttempts + usage.extra
  const base = {
    attemptsUsed: usage.used as number,
    attemptsAllowed,
    nextAvailableAt: null as string | null,
    activeAttemptId: (usage.active_id as string | null) ?? null,
  }

  if (base.activeAttemptId) return { ...base, canStart: true, reason: null }
  if (!isTestOpen(test)) return { ...base, canStart: false, reason: "Тестът в момента не е достъпен." }
  if (attemptsAllowed !== null && usage.used >= attemptsAllowed) {
    return { ...base, canStart: false, reason: "Изчерпа разрешените опити за този тест." }
  }
  if (settings.cooldownHours > 0 && usage.last_submitted) {
    const lastSubmitted = new Date(usage.last_submitted)
    const grantedAfter = usage.last_grant && new Date(usage.last_grant) > lastSubmitted
    const nextAt = new Date(lastSubmitted.getTime() + settings.cooldownHours * 3600_000)
    if (!grantedAfter && nextAt > new Date()) {
      return {
        ...base,
        canStart: false,
        nextAvailableAt: nextAt.toISOString(),
        reason: "Новият опит ще бъде достъпен по-късно.",
      }
    }
  }
  return { ...base, canStart: true, reason: null }
}

/* ------------------------------------------------------------------ */
/* Starting an attempt                                                 */
/* ------------------------------------------------------------------ */

export type StartResult = { ok: true; attemptId: string } | { ok: false; error: string }

async function loadTest(testId: number): Promise<TestRow | null> {
  const rows = await sql`SELECT * FROM et_tests WHERE id = ${testId}`
  return (rows[0] as TestRow) ?? null
}

type BankQuestion = {
  id: number
  type: QuestionSnapshot["type"]
  text: string
  level_id: number
  level_name: string
  difficulty: QuestionSnapshot["difficulty"]
  points: number
  explanation: string | null
}

/** Resolves the question ids a new attempt would receive. Exported for publish-time validation. */
export async function resolveQuestionIds(test: TestRow): Promise<{ ok: true; ids: number[] } | { ok: false; error: string }> {
  if (test.selection_method === "manual") {
    const rows = await sql`
      SELECT q.id FROM et_test_questions tq
      JOIN et_questions q ON q.id = tq.question_id
      WHERE tq.test_id = ${test.id} AND q.status = 'active'
      ORDER BY tq.display_order, tq.id
    `
    const ids = rows.map((r) => r.id as number)
    if (ids.length === 0) return { ok: false, error: "Тестът няма активни въпроси." }
    return { ok: true, ids }
  }
  const pool = (await sql`
    SELECT q.id, q.level_id AS "levelId", q.difficulty
    FROM et_questions q
    WHERE q.status = 'active'
      AND EXISTS (SELECT 1 FROM et_question_options o WHERE o.question_id = q.id AND o.is_correct)
  `) as PoolQuestion[]
  const config = parseSelectionConfig(test.selection_config)
  if (test.test_type === "level" && test.level_id && config.levelIds.length === 0) config.levelIds = [test.level_id]
  return selectRandomQuestions(pool, config, test.question_count)
}

export async function startAttempt(studentId: number, testId: number): Promise<StartResult> {
  await ensureEnglishTestsSchema()
  await finalizeExpiredAttempts({ studentId })

  const test = await loadTest(testId)
  if (!test) return { ok: false, error: "Тестът не е намерен." }

  const eligibility = await getEligibility(studentId, test)
  if (eligibility.activeAttemptId) return { ok: true, attemptId: eligibility.activeAttemptId }
  if (!eligibility.canStart) return { ok: false, error: eligibility.reason ?? "Тестът не може да бъде стартиран." }

  const settings = parseSettings(test.settings)
  const selection = await resolveQuestionIds(test)
  if (!selection.ok) return { ok: false, error: "Тестът в момента не може да бъде стартиран. Моля, опитай по-късно." }

  const ids = settings.shuffleQuestions ? shuffle(selection.ids) : selection.ids
  const questions = (await sql`
    SELECT q.id, q.type, q.text, q.level_id, l.name AS level_name,
           q.difficulty, q.points, q.explanation
    FROM et_questions q
    JOIN et_levels l ON l.id = q.level_id
    WHERE q.id = ANY(${ids}::int[])
  `) as BankQuestion[]
  const options = await sql`
    SELECT id, question_id, text, is_correct FROM et_question_options
    WHERE question_id = ANY(${ids}::int[])
    ORDER BY display_order, id
  `
  const byId = new Map(questions.map((q) => [q.id, q]))

  const snapshotRows = ids
    .filter((id) => byId.has(id))
    .map((id, index) => {
      const q = byId.get(id)!
      const own = options.filter((o) => o.question_id === id)
      const presented: OptionSnapshot[] = (settings.shuffleOptions && q.type !== "true_false" ? shuffle(own) : own).map(
        (o) => ({ id: o.id, text: o.text }),
      )
      const question: QuestionSnapshot = {
        text: q.text,
        type: q.type,
        points: q.points,
        levelId: q.level_id,
        levelName: q.level_name,
        difficulty: q.difficulty,
      }
      const grading: GradingSnapshot = {
        correctOptionIds: own.filter((o) => o.is_correct).map((o) => o.id),
        explanation: q.explanation,
      }
      return { questionId: id, order: index + 1, question, options: presented, grading }
    })

  if (snapshotRows.length === 0) return { ok: false, error: "Тестът няма налични въпроси." }

  const rule =
    test.test_type === "placement"
      ? (await sql`SELECT id FROM et_placement_rules WHERE test_id = ${test.id} ORDER BY version DESC LIMIT 1`)[0]
      : undefined

  const attemptId = randomUUID()
  try {
    // Attempt + its frozen question set are written atomically; the partial unique
    // index on active attempts makes concurrent "start" clicks idempotent.
    await sql.transaction([
      sql`
        INSERT INTO et_attempts (
          id, student_id, test_id, attempt_number, status, started_at, expires_at,
          test_title, test_type, settings_snapshot, placement_rule_id, total_questions
        )
        SELECT ${attemptId}::uuid, ${studentId}, ${test.id},
               coalesce((SELECT max(attempt_number) FROM et_attempts WHERE student_id = ${studentId} AND test_id = ${test.id}), 0) + 1,
               'in_progress', now(), now() + make_interval(mins => ${test.duration_minutes}),
               ${test.title}, ${test.test_type}, ${JSON.stringify(settings)}::jsonb, ${rule?.id ?? null}, ${snapshotRows.length}
      `,
      sql`
        INSERT INTO et_attempt_questions (attempt_id, original_question_id, display_order, question_snapshot, options_snapshot, grading_snapshot)
        SELECT ${attemptId}::uuid, (r->>'questionId')::int, (r->>'order')::int, r->'question', r->'options', r->'grading'
        FROM jsonb_array_elements(${JSON.stringify(snapshotRows)}::jsonb) AS r
      `,
    ])
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      const existing = await sql`
        SELECT id FROM et_attempts WHERE student_id = ${studentId} AND test_id = ${test.id} AND status IN ('in_progress', 'grading') LIMIT 1
      `
      if (existing[0]) return { ok: true, attemptId: existing[0].id }
    }
    throw err
  }
  return { ok: true, attemptId }
}

/* ------------------------------------------------------------------ */
/* Reading an attempt (student-safe: never selects grading_snapshot)   */
/* ------------------------------------------------------------------ */

export type StudentAttemptView = {
  id: string
  testId: number
  testTitle: string
  status: AttemptStatus
  startedAt: string
  expiresAt: string
  serverNow: string
  settings: Pick<TestSettings, "allowBack" | "allowAnswerChange">
  questions: { id: number; order: number; text: string; type: QuestionSnapshot["type"]; options: OptionSnapshot[] }[]
  answers: Record<number, { selected: number[]; version: number }>
}

export async function getAttemptForStudent(studentId: number, attemptId: string): Promise<StudentAttemptView | null> {
  if (!isUuid(attemptId)) return null
  await ensureEnglishTestsSchema()
  await finalizeExpiredAttempts({ studentId })
  const [attempt] = await sql`
    SELECT id, test_id, test_title, status, started_at, expires_at, settings_snapshot, now() AS server_now
    FROM et_attempts WHERE id = ${attemptId}::uuid AND student_id = ${studentId}
  `
  if (!attempt) return null
  const questions = await sql`
    SELECT id, display_order, question_snapshot->>'text' AS text, question_snapshot->>'type' AS type, options_snapshot
    FROM et_attempt_questions WHERE attempt_id = ${attemptId}::uuid ORDER BY display_order
  `
  const answers = await sql`
    SELECT attempt_question_id, selected_option_ids, answer_version FROM et_student_answers WHERE attempt_id = ${attemptId}::uuid
  `
  const settings = parseSettings(attempt.settings_snapshot)
  return {
    id: attempt.id,
    testId: attempt.test_id,
    testTitle: attempt.test_title,
    status: attempt.status,
    startedAt: new Date(attempt.started_at).toISOString(),
    expiresAt: new Date(attempt.expires_at).toISOString(),
    serverNow: new Date(attempt.server_now).toISOString(),
    settings: { allowBack: settings.allowBack, allowAnswerChange: settings.allowAnswerChange },
    questions: questions.map((q) => ({
      id: q.id,
      order: q.display_order,
      text: q.text,
      type: q.type,
      options: q.options_snapshot as OptionSnapshot[],
    })),
    answers: Object.fromEntries(
      answers.map((a) => [a.attempt_question_id, { selected: a.selected_option_ids, version: Number(a.answer_version) }]),
    ),
  }
}

/* ------------------------------------------------------------------ */
/* Saving answers                                                      */
/* ------------------------------------------------------------------ */

export type SaveAnswerResult =
  | { ok: true; version: number; superseded?: boolean }
  | { ok: false; error: string; closed?: boolean }

export async function saveAnswer(
  studentId: number,
  attemptId: string,
  attemptQuestionId: number,
  selectedIds: number[],
  version: number,
): Promise<SaveAnswerResult> {
  if (!isUuid(attemptId) || !Number.isInteger(attemptQuestionId) || !Number.isSafeInteger(version) || version <= 0) {
    return { ok: false, error: "Невалидна заявка." }
  }
  await ensureEnglishTestsSchema()
  const [target] = await sql`
    SELECT aq.options_snapshot, aq.question_snapshot->>'type' AS type, a.status, a.expires_at > now() AS open,
           a.settings_snapshot
    FROM et_attempt_questions aq
    JOIN et_attempts a ON a.id = aq.attempt_id
    WHERE aq.id = ${attemptQuestionId} AND a.id = ${attemptId}::uuid AND a.student_id = ${studentId}
  `
  if (!target) return { ok: false, error: "Въпросът не е намерен." }
  if (target.status !== "in_progress" || !target.open) {
    return { ok: false, error: "Времето за теста изтече или тестът е предаден.", closed: true }
  }

  const allowed = new Set((target.options_snapshot as OptionSnapshot[]).map((o) => o.id))
  const selected = [...new Set(selectedIds)]
  if (selected.some((id) => !allowed.has(id))) return { ok: false, error: "Невалиден отговор." }
  if (target.type !== "multiple" && selected.length > 1) return { ok: false, error: "Изберете само един отговор." }

  const allowChange = parseSettings(target.settings_snapshot).allowAnswerChange
  const payload = JSON.stringify(selected)

  // FOR SHARE on the attempt row serialises with the submit "claim" UPDATE, so an
  // answer can never land after grading has read the answers. The version guard
  // prevents an older in-flight request from overwriting a newer answer.
  const rows = allowChange
    ? await sql`
        INSERT INTO et_student_answers (attempt_id, attempt_question_id, selected_option_ids, answer_version)
        SELECT ${attemptId}::uuid, ${attemptQuestionId}, ${payload}::jsonb, ${version}
        WHERE EXISTS (
          SELECT 1 FROM et_attempts
          WHERE id = ${attemptId}::uuid AND student_id = ${studentId} AND status = 'in_progress' AND expires_at > now()
          FOR SHARE
        )
        ON CONFLICT (attempt_question_id) DO UPDATE
          SET selected_option_ids = EXCLUDED.selected_option_ids, answer_version = EXCLUDED.answer_version, saved_at = now()
          WHERE et_student_answers.answer_version < EXCLUDED.answer_version
        RETURNING answer_version
      `
    : await sql`
        INSERT INTO et_student_answers (attempt_id, attempt_question_id, selected_option_ids, answer_version)
        SELECT ${attemptId}::uuid, ${attemptQuestionId}, ${payload}::jsonb, ${version}
        WHERE EXISTS (
          SELECT 1 FROM et_attempts
          WHERE id = ${attemptId}::uuid AND student_id = ${studentId} AND status = 'in_progress' AND expires_at > now()
          FOR SHARE
        )
        ON CONFLICT (attempt_question_id) DO NOTHING
        RETURNING answer_version
      `

  if (rows[0]) return { ok: true, version: Number(rows[0].answer_version) }

  const [state] = await sql`
    SELECT a.status, a.expires_at > now() AS open, sa.answer_version
    FROM et_attempts a
    LEFT JOIN et_student_answers sa ON sa.attempt_question_id = ${attemptQuestionId}
    WHERE a.id = ${attemptId}::uuid AND a.student_id = ${studentId}
  `
  if (!state || state.status !== "in_progress" || !state.open) {
    return { ok: false, error: "Времето за теста изтече или тестът е предаден.", closed: true }
  }
  if (!allowChange) return { ok: false, error: "Отговорите не могат да се променят в този тест." }
  return { ok: true, version: Number(state.answer_version), superseded: true }
}

/* ------------------------------------------------------------------ */
/* Finalising (submit / expiry)                                        */
/* ------------------------------------------------------------------ */

export type FinalizeResult = { status: "finalized" | "already_finalized" | "not_found" }

/**
 * Idempotent: the conditional "claim" UPDATE guarantees only one caller grades an
 * attempt, so duplicate submissions, the timer and the expiry sweep can all race safely.
 */
export async function finalizeAttempt(attemptId: string, studentId?: number): Promise<FinalizeResult> {
  const claimed = await sql`
    UPDATE et_attempts SET status = 'grading', updated_at = now()
    WHERE id = ${attemptId}::uuid
      AND (${studentId ?? null}::int IS NULL OR student_id = ${studentId ?? null}::int)
      AND (status = 'in_progress' OR (status = 'grading' AND updated_at < now() - interval '2 minutes'))
    RETURNING id, expires_at, placement_rule_id, test_type, now() AS claimed_at
  `
  const attempt = claimed[0]
  if (!attempt) {
    const exists = await sql`SELECT 1 FROM et_attempts WHERE id = ${attemptId}::uuid`
    return { status: exists[0] ? "already_finalized" : "not_found" }
  }

  const questionRows = await sql`
    SELECT id, question_snapshot, grading_snapshot FROM et_attempt_questions WHERE attempt_id = ${attemptId}::uuid
  `
  const answerRows = await sql`
    SELECT attempt_question_id, selected_option_ids FROM et_student_answers WHERE attempt_id = ${attemptId}::uuid
  `
  const questions: GradableQuestion[] = questionRows.map((r) => ({
    attemptQuestionId: r.id,
    type: r.question_snapshot.type,
    points: r.question_snapshot.points,
    levelId: r.question_snapshot.levelId,
    correctOptionIds: (r.grading_snapshot as GradingSnapshot).correctOptionIds,
  }))
  const answers = new Map<number, number[]>(answerRows.map((a) => [a.attempt_question_id, a.selected_option_ids]))
  const grade = gradeAttempt(questions, answers)

  let placement = null
  if (attempt.test_type === "placement" && attempt.placement_rule_id) {
    const [rule] = await sql`SELECT rule_configuration FROM et_placement_rules WHERE id = ${attempt.placement_rule_id}`
    placement = estimatePlacement(
      (rule?.rule_configuration as PlacementRuleConfig) ?? null,
      grade.perLevel,
      grade.answered,
      grade.percentage,
    )
  } else if (attempt.test_type === "placement") {
    placement = estimatePlacement(null, grade.perLevel, grade.answered)
  }

  const expired = new Date(attempt.claimed_at) > new Date(attempt.expires_at)
  const finalStatus: AttemptStatus = expired ? "expired" : "submitted"

  await sql.transaction([
    sql`
      UPDATE et_attempt_questions aq
      SET is_correct = (g->>'isCorrect')::boolean, earned_points = (g->>'earnedPoints')::int
      FROM jsonb_array_elements(${JSON.stringify(grade.perQuestion)}::jsonb) AS g
      WHERE aq.id = (g->>'attemptQuestionId')::int AND aq.attempt_id = ${attemptId}::uuid
    `,
    sql`
      UPDATE et_attempts SET
        status = ${finalStatus},
        submitted_at = LEAST(now(), expires_at),
        answered_count = ${grade.answered},
        correct_count = ${grade.correct},
        incorrect_count = ${grade.incorrect},
        unanswered_count = ${grade.unanswered},
        score = ${grade.score},
        max_score = ${grade.maxScore},
        percentage = ${grade.percentage},
        estimated_level = ${placement?.levelName ?? null},
        placement_conclusive = ${placement ? placement.conclusive : null},
        placement_details = ${placement ? JSON.stringify(placement) : null}::jsonb,
        updated_at = now()
      WHERE id = ${attemptId}::uuid AND status = 'grading'
    `,
  ])
  return { status: "finalized" }
}

/** Enforces deadlines even if the browser was closed. Runs lazily on reads and from the cron route. */
export async function finalizeExpiredAttempts(scope: { studentId?: number; limit?: number } = {}) {
  const rows = await sql`
    SELECT id FROM et_attempts
    WHERE (${scope.studentId ?? null}::int IS NULL OR student_id = ${scope.studentId ?? null}::int)
      AND ((status = 'in_progress' AND expires_at <= now())
        OR (status = 'grading' AND updated_at < now() - interval '2 minutes'))
    ORDER BY expires_at
    LIMIT ${scope.limit ?? 25}
  `
  for (const row of rows) {
    await finalizeAttempt(row.id)
  }
  return rows.length
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}
