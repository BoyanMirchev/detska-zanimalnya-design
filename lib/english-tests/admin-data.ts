import "server-only"
import { sql } from "@/lib/db"
import { requireAdmin } from "./auth"
import { finalizeExpiredAttempts } from "./engine"
import { parseSelectionConfig, parseSettings } from "./validation"
import type {
  Difficulty,
  GradingSnapshot,
  OptionSnapshot,
  PlacementRuleConfig,
  QuestionSnapshot,
  QuestionStatus,
  QuestionType,
  SelectionConfig,
  TestSettings,
} from "./types"
import type { PlacementOutcome } from "./grading"

export const PAGE_SIZE = 25

const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null)

/* ---------------- Overview ---------------- */

export async function getOverviewStats() {
  await requireAdmin()
  await finalizeExpiredAttempts({ limit: 50 })
  const [counts] = await sql`
    SELECT
      (SELECT count(*)::int FROM et_questions WHERE status <> 'archived') AS questions,
      (SELECT count(*)::int FROM et_questions WHERE status = 'active') AS active_questions,
      (SELECT count(*)::int FROM et_tests WHERE status = 'published') AS published_tests,
      (SELECT count(*)::int FROM et_students) AS students,
      (SELECT count(*)::int FROM et_attempts WHERE status IN ('submitted', 'expired')) AS completed,
      (SELECT count(*)::int FROM et_attempts WHERE status = 'in_progress') AS in_progress,
      (SELECT round(avg(percentage), 1) FROM et_attempts WHERE status IN ('submitted', 'expired')) AS avg_percent,
      (SELECT count(*)::int FROM et_recovery_requests WHERE status = 'pending') AS pending_recovery
  `
  const distribution = await sql`
    SELECT coalesce(estimated_level, '__none__') AS level, count(*)::int AS n
    FROM et_attempts WHERE status IN ('submitted', 'expired') AND test_type = 'placement'
    GROUP BY 1 ORDER BY 2 DESC
  `
  const recent = await sql`
    SELECT a.id, a.test_title, a.percentage, a.estimated_level, a.submitted_at, a.status, s.first_name, s.last_name
    FROM et_attempts a JOIN et_students s ON s.id = a.student_id
    WHERE a.status IN ('submitted', 'expired')
    ORDER BY a.submitted_at DESC LIMIT 6
  `
  return {
    questions: counts.questions as number,
    activeQuestions: counts.active_questions as number,
    publishedTests: counts.published_tests as number,
    students: counts.students as number,
    completed: counts.completed as number,
    inProgress: counts.in_progress as number,
    avgPercent: counts.avg_percent === null ? null : Number(counts.avg_percent),
    pendingRecovery: counts.pending_recovery as number,
    distribution: distribution.map((d) => ({ level: d.level === "__none__" ? null : (d.level as string), count: d.n as number })),
    recent: recent.map((r) => ({
      id: r.id as string,
      testTitle: r.test_title as string,
      percentage: r.percentage === null ? null : Number(r.percentage),
      level: r.estimated_level as string | null,
      submittedAt: iso(r.submitted_at),
      status: r.status as string,
      studentName: `${r.first_name} ${r.last_name}`,
    })),
  }
}

/* ---------------- Levels ---------------- */

export type AdminLevel = {
  id: number
  name: string
  description: string
  displayOrder: number
  isActive: boolean
  archived: boolean
  questionCount: number
  defaultMinPercent: number
  defaultMinQuestions: number
}

export async function listLevels(): Promise<AdminLevel[]> {
  await requireAdmin()
  const rows = await sql`
    SELECT l.*, (SELECT count(*)::int FROM et_questions q WHERE q.level_id = l.id AND q.status <> 'archived') AS question_count
    FROM et_levels l ORDER BY l.archived_at IS NOT NULL, l.display_order, l.id
  `
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    displayOrder: r.display_order,
    isActive: r.is_active,
    archived: r.archived_at !== null,
    questionCount: r.question_count,
    defaultMinPercent: r.default_min_percent ?? 70,
    defaultMinQuestions: r.default_min_questions ?? 3,
  }))
}


/* ---------------- Questions ---------------- */

export type QuestionFilters = {
  q?: string
  level?: number
  difficulty?: string
  status?: string
  sort?: string
  page?: number
}

export type AdminQuestionRow = {
  id: number
  type: QuestionType
  text: string
  levelName: string
  difficulty: Difficulty
  points: number
  status: QuestionStatus
  optionCount: number
  testCount: number
  updatedAt: string
}

export async function listQuestions(filters: QuestionFilters) {
  await requireAdmin()
  const page = Math.max(1, filters.page ?? 1)
  const search = filters.q?.trim() ? `%${filters.q.trim().replace(/[%_\\]/g, (m) => `\\${m}`)}%` : null
  const status = filters.status && filters.status !== "all" ? filters.status : null
  const hideArchived = !filters.status
  const sort = filters.sort ?? "updated"

  const rows = await sql`
    SELECT q.id, q.type, q.text, q.difficulty, q.points, q.status, q.updated_at,
           l.name AS level_name, l.display_order,
           (SELECT count(*)::int FROM et_question_options o WHERE o.question_id = q.id) AS option_count,
           (SELECT count(*)::int FROM et_test_questions tq WHERE tq.question_id = q.id) AS test_count,
           count(*) OVER ()::int AS total
    FROM et_questions q
    JOIN et_levels l ON l.id = q.level_id
    WHERE (${search}::text IS NULL OR q.text ILIKE ${search})
      AND (${filters.level ?? null}::int IS NULL OR q.level_id = ${filters.level ?? null}::int)
      AND (${filters.difficulty || null}::text IS NULL OR q.difficulty = ${filters.difficulty || null}::text)
      AND (${status}::text IS NULL OR q.status = ${status}::text)
      AND (NOT ${hideArchived} OR q.status <> 'archived')
    ORDER BY
      CASE WHEN ${sort} = 'level' THEN l.display_order END ASC,
      CASE WHEN ${sort} = 'points' THEN q.points END DESC,
      CASE WHEN ${sort} = 'text' THEN q.text END ASC,
      q.updated_at DESC, q.id DESC
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
  `
  return {
    page,
    total: (rows[0]?.total as number) ?? 0,
    rows: rows.map(
      (r): AdminQuestionRow => ({
        id: r.id,
        type: r.type,
        text: r.text,
        levelName: r.level_name,
        difficulty: r.difficulty,
        points: r.points,
        status: r.status,
        optionCount: r.option_count,
        testCount: r.test_count,
        updatedAt: iso(r.updated_at)!,
      }),
    ),
  }
}

export type AdminQuestionDetail = {
  id: number
  type: QuestionType
  text: string
  levelId: number
  difficulty: Difficulty
  points: number
  explanation: string
  status: QuestionStatus
  version: number
  options: { text: string; isCorrect: boolean }[]
  tests: { id: number; title: string; status: string }[]
  attemptCount: number
}

export async function getQuestion(id: number): Promise<AdminQuestionDetail | null> {
  await requireAdmin()
  if (!Number.isInteger(id) || id <= 0) return null
  const [q] = await sql`SELECT * FROM et_questions WHERE id = ${id}`
  if (!q) return null
  const [options, tests, attempts] = await Promise.all([
    sql`SELECT text, is_correct FROM et_question_options WHERE question_id = ${id} ORDER BY display_order, id`,
    sql`SELECT t.id, t.title, t.status FROM et_test_questions tq JOIN et_tests t ON t.id = tq.test_id WHERE tq.question_id = ${id} ORDER BY t.title`,
    sql`SELECT count(*)::int AS n FROM et_attempt_questions WHERE original_question_id = ${id}`,
  ])
  return {
    id: q.id,
    type: q.type,
    text: q.text,
    levelId: q.level_id,
    difficulty: q.difficulty,
    points: q.points,
    explanation: q.explanation ?? "",
    status: q.status,
    version: q.version,
    options: options.map((o) => ({ text: o.text, isCorrect: o.is_correct })),
    tests: tests.map((t) => ({ id: t.id, title: t.title, status: t.status })),
    attemptCount: attempts[0].n,
  }
}

/** Compact list for the manual question picker in the test builder. */
export async function listPickerQuestions() {
  await requireAdmin()
  const rows = await sql`
    SELECT q.id, q.text, q.type, q.difficulty, q.points, q.level_id, l.name AS level_name,
           COALESCE((SELECT json_agg(json_build_object('text', o.text, 'isCorrect', o.is_correct) ORDER BY o.display_order, o.id)
                     FROM et_question_options o WHERE o.question_id = q.id), '[]'::json) AS options,
           COALESCE((SELECT json_agg(json_build_object('id', t.id, 'title', t.title) ORDER BY t.id)
                     FROM et_test_questions tq JOIN et_tests t ON t.id = tq.test_id
                     WHERE tq.question_id = q.id AND t.status <> 'archived'), '[]'::json) AS tests
    FROM et_questions q
    JOIN et_levels l ON l.id = q.level_id
    WHERE q.status = 'active'
    ORDER BY l.display_order, q.id
  `
  return rows.map((r) => ({
    id: r.id as number,
    text: r.text as string,
    type: r.type as QuestionType,
    difficulty: r.difficulty as Difficulty,
    points: r.points as number,
    levelId: r.level_id as number,
    levelName: r.level_name as string,
    options: r.options as { text: string; isCorrect: boolean }[],
    tests: r.tests as { id: number; title: string }[],
  }))
}

export type PickerQuestion = Awaited<ReturnType<typeof listPickerQuestions>>[number]

/* ---------------- Tests ---------------- */

export async function listTests() {
  await requireAdmin()
  const rows = await sql`
    SELECT t.id, t.title, t.test_type, t.status, t.duration_minutes, t.question_count, t.selection_method,
           t.available_from, t.available_until, t.updated_at, l.name AS level_name,
           (SELECT count(*)::int FROM et_attempts a WHERE a.test_id = t.id AND a.status IN ('submitted', 'expired')) AS completed,
           (SELECT max(version) FROM et_placement_rules r WHERE r.test_id = t.id) AS rules_version
    FROM et_tests t LEFT JOIN et_levels l ON l.id = t.level_id
    ORDER BY t.status = 'archived', t.updated_at DESC
  `
  return rows.map((r) => ({
    id: r.id as number,
    title: r.title as string,
    testType: r.test_type as "level" | "placement",
    status: r.status as string,
    durationMinutes: r.duration_minutes as number,
    questionCount: r.question_count as number,
    selectionMethod: r.selection_method as string,
    availableFrom: iso(r.available_from),
    availableUntil: iso(r.available_until),
    levelName: r.level_name as string | null,
    completed: r.completed as number,
    rulesVersion: r.rules_version as number | null,
  }))
}

export type AdminTestDetail = {
  id: number
  title: string
  description: string
  testType: "level" | "placement"
  levelId: number | null
  durationMinutes: number
  questionCount: number
  selectionMethod: "manual" | "random"
  selectionConfig: SelectionConfig
  questionIds: number[]
  status: string
  settings: TestSettings
  availableFrom: string | null
  availableUntil: string | null
  placementRules: (PlacementRuleConfig & { version: number }) | null
  attemptCount: number
  activeAttemptCount: number
  editVersion: number
}

export async function getTest(id: number): Promise<AdminTestDetail | null> {
  await requireAdmin()
  if (!Number.isInteger(id) || id <= 0) return null
  const [t] = await sql`SELECT * FROM et_tests WHERE id = ${id}`
  if (!t) return null
  const [questions, rules, attempts] = await Promise.all([
    sql`SELECT question_id FROM et_test_questions WHERE test_id = ${id} ORDER BY display_order, id`,
    sql`SELECT rule_configuration, version FROM et_placement_rules WHERE test_id = ${id} ORDER BY version DESC LIMIT 1`,
    sql`SELECT count(*)::int AS n, count(*) FILTER (WHERE status IN ('in_progress', 'grading'))::int AS active FROM et_attempts WHERE test_id = ${id}`,
  ])
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    testType: t.test_type,
    levelId: t.level_id,
    durationMinutes: t.duration_minutes,
    questionCount: t.question_count,
    selectionMethod: t.selection_method,
    selectionConfig: parseSelectionConfig(t.selection_config),
    questionIds: questions.map((q) => q.question_id),
    status: t.status,
    settings: parseSettings(t.settings),
    availableFrom: iso(t.available_from),
    availableUntil: iso(t.available_until),
    placementRules: rules[0] ? { ...(rules[0].rule_configuration as PlacementRuleConfig), version: rules[0].version } : null,
    attemptCount: attempts[0].n,
    activeAttemptCount: attempts[0].active,
    editVersion: t.edit_version ?? 1,
  }
}

/* ---------------- Results ---------------- */

export type ResultFilters = {
  student?: string
  test?: number
  level?: string
  from?: string
  to?: string
  minScore?: number
  maxScore?: number
  page?: number
}

function resultConditions(f: ResultFilters) {
  const student = f.student?.trim() ? `%${f.student.trim().replace(/[%_\\]/g, (m) => `\\${m}`)}%` : null
  const from = f.from && !Number.isNaN(Date.parse(f.from)) ? new Date(f.from).toISOString() : null
  const to = f.to && !Number.isNaN(Date.parse(f.to)) ? new Date(new Date(f.to).getTime() + 86_400_000).toISOString() : null
  return {
    student,
    test: f.test && f.test > 0 ? f.test : null,
    level: f.level?.trim() || null,
    from,
    to,
    min: Number.isFinite(f.minScore) ? f.minScore! : null,
    max: Number.isFinite(f.maxScore) ? f.maxScore! : null,
  }
}

export async function listResults(filters: ResultFilters, opts: { all?: boolean } = {}) {
  await requireAdmin()
  await finalizeExpiredAttempts({ limit: 50 })
  const c = resultConditions(filters)
  const page = Math.max(1, filters.page ?? 1)
  const limit = opts.all ? 5000 : PAGE_SIZE
  const offset = opts.all ? 0 : (page - 1) * PAGE_SIZE
  const rows = await sql`
    SELECT a.id, a.test_title, a.test_type, a.attempt_number, a.status, a.started_at, a.submitted_at, a.correct_count,
           a.total_questions, a.score, a.max_score, a.percentage, a.estimated_level, a.placement_conclusive,
           s.id AS student_id, s.first_name, s.last_name, s.username,
           count(*) OVER ()::int AS total
    FROM et_attempts a JOIN et_students s ON s.id = a.student_id
    WHERE a.status IN ('submitted', 'expired')
      AND (${c.student}::text IS NULL OR s.username ILIKE ${c.student} OR (s.first_name || ' ' || s.last_name) ILIKE ${c.student})
      AND (${c.test}::int IS NULL OR a.test_id = ${c.test}::int)
      AND (${c.level}::text IS NULL OR (${c.level} = '__none__' AND a.estimated_level IS NULL AND a.test_type = 'placement') OR a.estimated_level = ${c.level})
      AND (${c.from}::timestamptz IS NULL OR a.submitted_at >= ${c.from}::timestamptz)
      AND (${c.to}::timestamptz IS NULL OR a.submitted_at < ${c.to}::timestamptz)
      AND (${c.min}::numeric IS NULL OR a.percentage >= ${c.min}::numeric)
      AND (${c.max}::numeric IS NULL OR a.percentage <= ${c.max}::numeric)
    ORDER BY a.submitted_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return {
    page,
    total: (rows[0]?.total as number) ?? 0,
    rows: rows.map((r) => ({
      id: r.id as string,
      testTitle: r.test_title as string,
      testType: r.test_type as string,
      attemptNumber: r.attempt_number as number,
      status: r.status as string,
      startedAt: iso(r.started_at)!,
      submittedAt: iso(r.submitted_at),
      correct: r.correct_count as number,
      total: r.total_questions as number,
      score: r.score as number,
      maxScore: r.max_score as number,
      percentage: r.percentage === null ? null : Number(r.percentage),
      level: r.estimated_level as string | null,
      conclusive: r.placement_conclusive as boolean | null,
      studentId: r.student_id as number,
      studentName: `${r.first_name} ${r.last_name}`,
      username: r.username as string,
    })),
  }
}

export type AdminResultRow = Awaited<ReturnType<typeof listResults>>["rows"][number]

export async function getAdminResult(attemptId: string) {
  await requireAdmin()
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) return null
  await finalizeExpiredAttempts({ limit: 10 })
  const [a] = await sql`
    SELECT a.*, s.first_name, s.last_name, s.username, s.id AS sid
    FROM et_attempts a JOIN et_students s ON s.id = a.student_id WHERE a.id = ${attemptId}::uuid
  `
  if (!a) return null
  const [questions, notes, history, rule] = await Promise.all([
    sql`
      SELECT aq.id, aq.display_order, aq.question_snapshot, aq.options_snapshot, aq.grading_snapshot, aq.is_correct,
             aq.earned_points, sa.selected_option_ids, sa.saved_at
      FROM et_attempt_questions aq
      LEFT JOIN et_student_answers sa ON sa.attempt_question_id = aq.id
      WHERE aq.attempt_id = ${attemptId}::uuid ORDER BY aq.display_order
    `,
    sql`SELECT id, note, created_at FROM et_admin_notes WHERE attempt_id = ${attemptId}::uuid ORDER BY created_at DESC`,
    sql`
      SELECT id, test_title, attempt_number, status, submitted_at, percentage, estimated_level
      FROM et_attempts WHERE student_id = ${a.student_id} AND status IN ('submitted', 'expired')
      ORDER BY submitted_at DESC LIMIT 20
    `,
    a.placement_rule_id
      ? sql`SELECT version FROM et_placement_rules WHERE id = ${a.placement_rule_id}`
      : Promise.resolve([] as Record<string, unknown>[]),
  ])
  return {
    id: a.id as string,
    testId: a.test_id as number,
    testTitle: a.test_title as string,
    testType: a.test_type as string,
    attemptNumber: a.attempt_number as number,
    status: a.status as string,
    startedAt: iso(a.started_at)!,
    expiresAt: iso(a.expires_at)!,
    submittedAt: iso(a.submitted_at),
    answered: a.answered_count as number | null,
    correct: a.correct_count as number | null,
    incorrect: a.incorrect_count as number | null,
    unanswered: a.unanswered_count as number | null,
    total: a.total_questions as number,
    score: a.score as number | null,
    maxScore: a.max_score as number | null,
    percentage: a.percentage === null ? null : Number(a.percentage),
    level: a.estimated_level as string | null,
    conclusive: a.placement_conclusive as boolean | null,
    placement: (a.placement_details as PlacementOutcome | null) ?? null,
    rulesVersion: (rule[0]?.version as number | undefined) ?? null,
    student: { id: a.sid as number, name: `${a.first_name} ${a.last_name}`, username: a.username as string },
    questions: questions.map((q) => {
      const snap = q.question_snapshot as QuestionSnapshot
      const grading = q.grading_snapshot as GradingSnapshot
      const selected = new Set<number>((q.selected_option_ids as number[] | null) ?? [])
      return {
        id: q.id as number,
        order: q.display_order as number,
        text: snap.text,
        type: snap.type,
        levelName: snap.levelName,
        points: snap.points,
        isCorrect: q.is_correct as boolean | null,
        earned: q.earned_points as number | null,
        answered: selected.size > 0,
        savedAt: iso(q.saved_at),
        options: (q.options_snapshot as OptionSnapshot[]).map((o) => ({
          ...o,
          correct: grading.correctOptionIds.includes(o.id),
          selected: selected.has(o.id),
        })),
      }
    }),
    notes: notes.map((n) => ({ id: n.id as number, note: n.note as string, createdAt: iso(n.created_at)! })),
    history: history.map((h) => ({
      id: h.id as string,
      testTitle: h.test_title as string,
      attemptNumber: h.attempt_number as number,
      status: h.status as string,
      submittedAt: iso(h.submitted_at),
      percentage: h.percentage === null ? null : Number(h.percentage),
      level: h.estimated_level as string | null,
    })),
  }
}

/* ---------------- Students ---------------- */

export async function listStudents(filters: { q?: string; page?: number }) {
  await requireAdmin()
  const page = Math.max(1, filters.page ?? 1)
  const search = filters.q?.trim() ? `%${filters.q.trim().replace(/[%_\\]/g, (m) => `\\${m}`)}%` : null
  const rows = await sql`
    SELECT s.id, s.username, s.first_name, s.last_name, s.school_grade, s.age_group, s.status, s.created_at,
           (SELECT count(*)::int FROM et_attempts a WHERE a.student_id = s.id AND a.status IN ('submitted', 'expired')) AS completed,
           latest.percentage AS latest_percentage, latest.estimated_level AS latest_level,
           count(*) OVER ()::int AS total
    FROM et_students s
    LEFT JOIN LATERAL (
      SELECT percentage, estimated_level FROM et_attempts a
      WHERE a.student_id = s.id AND a.status IN ('submitted', 'expired')
      ORDER BY submitted_at DESC LIMIT 1
    ) latest ON true
    WHERE (${search}::text IS NULL OR s.username ILIKE ${search} OR (s.first_name || ' ' || s.last_name) ILIKE ${search})
    ORDER BY s.created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
  `
  return {
    page,
    total: (rows[0]?.total as number) ?? 0,
    rows: rows.map((r) => ({
      id: r.id as number,
      username: r.username as string,
      name: `${r.first_name} ${r.last_name}`,
      schoolGrade: r.school_grade as string | null,
      ageGroup: r.age_group as string | null,
      status: r.status as "active" | "disabled",
      createdAt: iso(r.created_at)!,
      completed: r.completed as number,
      latestPercentage: r.latest_percentage === null ? null : Number(r.latest_percentage),
      latestLevel: r.latest_level as string | null,
    })),
  }
}

export type AdminStudentRow = Awaited<ReturnType<typeof listStudents>>["rows"][number]

export async function listRecoveryRequests() {
  await requireAdmin()
  const rows = await sql`
    SELECT r.id, r.username_entered, r.created_at, s.id AS student_id, s.first_name, s.last_name, s.username
    FROM et_recovery_requests r LEFT JOIN et_students s ON s.id = r.student_id
    WHERE r.status = 'pending' ORDER BY r.created_at DESC LIMIT 50
  `
  return rows.map((r) => ({
    id: r.id as number,
    createdAt: iso(r.created_at)!,
    studentId: r.student_id as number | null,
    name: r.student_id ? `${r.first_name} ${r.last_name}` : null,
    username: (r.username ?? r.username_entered) as string,
  }))
}

export async function listAuditLog(limit = 40) {
  await requireAdmin()
  const rows = await sql`SELECT id, action, entity_type, entity_id, details, created_at FROM et_audit_logs ORDER BY id DESC LIMIT ${limit}`
  return rows.map((r) => ({
    id: Number(r.id),
    action: r.action as string,
    entityType: r.entity_type as string,
    entityId: r.entity_id as string | null,
    details: r.details as Record<string, unknown>,
    createdAt: iso(r.created_at)!,
  }))
}
