"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { sql } from "@/lib/db"
import { AuthError, audit, requireAdmin, revokeAllStudentSessions } from "@/lib/english-tests/auth"
import { generateToken, hashToken } from "@/lib/english-tests/crypto"
import { resolveQuestionIds, type TestRow } from "@/lib/english-tests/engine"
import {
  validateCategory,
  validateLevel,
  validatePlacementRules,
  validateQuestion,
  validateTest,
  type Errors,
} from "@/lib/english-tests/validation"
import { TEST_STATUSES, type TestStatus } from "@/lib/english-tests/types"

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error?: string; errors?: Errors }

const BASE = "/admin/english-tests"

async function guard<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    await requireAdmin()
    return await fn()
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: "Нямате достъп. Влезте отново в админ панела." }
    if ((err as { code?: string }).code === "23505") return { ok: false, error: "Вече съществува запис с това име." }
    if ((err as { code?: string }).code === "23503") return { ok: false, error: "Записът се използва и не може да бъде изтрит." }
    console.error("[english-tests] admin action failed:", (err as Error).message)
    return { ok: false, error: "Възникна грешка. Опитайте отново." }
  }
}

const validId = (id: unknown): id is number => Number.isInteger(id) && (id as number) > 0

const CONFLICT_MESSAGE =
  "Тестът е бил променен от друг администратор, докато редактирахте. Промените ви не са запазени — копирайте ги, презаредете страницата и опитайте отново."

/* ---------------- Levels ---------------- */

export async function saveLevel(id: number | null, input: { name: string; description: string; displayOrder: number }) {
  return guard(async () => {
    const parsed = validateLevel(input)
    if (!parsed.ok) return { ok: false, errors: parsed.errors }
    const { name, description, displayOrder } = parsed.data
    if (id === null) {
      const [row] = await sql`
        INSERT INTO et_levels (name, description, display_order) VALUES (${name}, ${description}, ${displayOrder}) RETURNING id
      `
      await audit("level.create", "level", row.id, { name })
    } else {
      if (!validId(id)) return { ok: false, error: "Невалидно ниво." }
      await sql`
        UPDATE et_levels SET name = ${name}, description = ${description}, display_order = ${displayOrder}, updated_at = now()
        WHERE id = ${id}
      `
      await audit("level.update", "level", id, { name, displayOrder })
    }
    revalidatePath(`${BASE}/levels`)
    return { ok: true, message: "Нивото е запазено." }
  })
}

export async function setLevelState(id: number, state: "active" | "inactive" | "archived" | "restore") {
  return guard(async () => {
    if (!validId(id)) return { ok: false, error: "Невалидно ниво." }
    if (state === "archived") {
      await sql`UPDATE et_levels SET archived_at = now(), is_active = false, updated_at = now() WHERE id = ${id}`
    } else if (state === "restore") {
      await sql`UPDATE et_levels SET archived_at = NULL, is_active = true, updated_at = now() WHERE id = ${id}`
    } else {
      await sql`UPDATE et_levels SET is_active = ${state === "active"}, updated_at = now() WHERE id = ${id}`
    }
    await audit(`level.${state}`, "level", id)
    revalidatePath(`${BASE}/levels`)
    return { ok: true }
  })
}

export async function moveLevel(id: number, direction: "up" | "down") {
  return guard(async () => {
    if (!validId(id)) return { ok: false, error: "Невалидно ниво." }
    const levels = await sql`SELECT id FROM et_levels WHERE archived_at IS NULL ORDER BY display_order, id`
    const ids = levels.map((l) => l.id as number)
    const index = ids.indexOf(id)
    const target = direction === "up" ? index - 1 : index + 1
    if (index < 0 || target < 0 || target >= ids.length) return { ok: true }
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    await sql`
      UPDATE et_levels l SET display_order = o.ord, updated_at = now()
      FROM unnest(${ids}::int[]) WITH ORDINALITY AS o(id, ord) WHERE l.id = o.id
    `
    revalidatePath(`${BASE}/levels`)
    return { ok: true }
  })
}

/* ---------------- Categories ---------------- */

export async function saveCategory(id: number | null, input: { name: string; description: string }) {
  return guard(async () => {
    const parsed = validateCategory(input)
    if (!parsed.ok) return { ok: false, errors: parsed.errors }
    const { name, description } = parsed.data
    if (id === null) {
      await sql`INSERT INTO et_categories (name, description) VALUES (${name}, ${description})`
    } else {
      if (!validId(id)) return { ok: false, error: "Невалидна категория." }
      await sql`UPDATE et_categories SET name = ${name}, description = ${description}, updated_at = now() WHERE id = ${id}`
    }
    await audit(id === null ? "category.create" : "category.update", "category", id, { name })
    revalidatePath(`${BASE}/levels`)
    return { ok: true, message: "Категорията е запазена." }
  })
}

export async function setCategoryActive(id: number, active: boolean) {
  return guard(async () => {
    if (!validId(id)) return { ok: false, error: "Невалидна категория." }
    await sql`UPDATE et_categories SET is_active = ${active}, updated_at = now() WHERE id = ${id}`
    revalidatePath(`${BASE}/levels`)
    return { ok: true }
  })
}

/* ---------------- Questions ---------------- */

export async function saveQuestion(id: number | null, raw: Record<string, unknown>) {
  return guard<{ id: number }>(async () => {
    const parsed = validateQuestion(raw)
    if (!parsed.ok) return { ok: false, errors: parsed.errors }
    const q = parsed.data
    const [refs] = await sql`
      SELECT (SELECT archived_at IS NULL FROM et_levels WHERE id = ${q.levelId}) AS level_ok,
             (SELECT true FROM et_categories WHERE id = ${q.categoryId}) AS category_ok
    `
    if (!refs.level_ok) return { ok: false, errors: { levelId: "Нивото не съществува или е архивирано." } }
    if (!refs.category_ok) return { ok: false, errors: { categoryId: "Категорията не съществува." } }

    const options = JSON.stringify(q.options.map((o, i) => ({ ...o, order: i + 1 })))
    let questionId: number
    if (id === null) {
      const [row] = await sql`
        WITH q AS (
          INSERT INTO et_questions (type, text, level_id, category_id, difficulty, points, explanation, status)
          VALUES (${q.type}, ${q.text}, ${q.levelId}, ${q.categoryId}, ${q.difficulty}, ${q.points}, ${q.explanation}, ${q.status})
          RETURNING id
        ), o AS (
          INSERT INTO et_question_options (question_id, text, is_correct, display_order)
          SELECT q.id, x->>'text', (x->>'isCorrect')::boolean, (x->>'order')::int
          FROM q, jsonb_array_elements(${options}::jsonb) AS x
        )
        SELECT id FROM q
      `
      questionId = row.id
      await audit("question.create", "question", questionId)
    } else {
      if (!validId(id)) return { ok: false, error: "Невалиден въпрос." }
      // Attempts keep their own immutable snapshots, so editing the bank never alters started or finished attempts.
      await sql.transaction([
        sql`
          UPDATE et_questions SET type = ${q.type}, text = ${q.text}, level_id = ${q.levelId}, category_id = ${q.categoryId},
            difficulty = ${q.difficulty}, points = ${q.points}, explanation = ${q.explanation}, status = ${q.status},
            version = version + 1, updated_at = now()
          WHERE id = ${id}
        `,
        sql`DELETE FROM et_question_options WHERE question_id = ${id}`,
        sql`
          INSERT INTO et_question_options (question_id, text, is_correct, display_order)
          SELECT ${id}, x->>'text', (x->>'isCorrect')::boolean, (x->>'order')::int
          FROM jsonb_array_elements(${options}::jsonb) AS x
        `,
      ])
      questionId = id
      await audit("question.update", "question", id)
    }
    revalidatePath(`${BASE}/questions`)
    return { ok: true, data: { id: questionId }, message: "Въпросът е запазен." }
  })
}

export async function duplicateQuestion(id: number) {
  return guard<{ id: number }>(async () => {
    if (!validId(id)) return { ok: false, error: "Невалиден въпрос." }
    const [row] = await sql`
      WITH src AS (SELECT * FROM et_questions WHERE id = ${id}),
      q AS (
        INSERT INTO et_questions (type, text, level_id, category_id, difficulty, points, explanation, status)
        SELECT type, text, level_id, category_id, difficulty, points, explanation, 'inactive' FROM src
        RETURNING id
      ), o AS (
        INSERT INTO et_question_options (question_id, text, is_correct, display_order)
        SELECT q.id, opt.text, opt.is_correct, opt.display_order FROM q, et_question_options opt WHERE opt.question_id = ${id}
      )
      SELECT id FROM q
    `
    if (!row) return { ok: false, error: "Въпросът не е намерен." }
    await audit("question.duplicate", "question", row.id, { from: id })
    revalidatePath(`${BASE}/questions`)
    return { ok: true, data: { id: row.id }, message: "Създадено е копие (неактивно)." }
  })
}

export async function setQuestionsStatus(ids: number[], status: "active" | "inactive" | "archived") {
  return guard(async () => {
    const clean = [...new Set(ids)].filter(validId).slice(0, 500)
    if (!clean.length || !["active", "inactive", "archived"].includes(status)) return { ok: false, error: "Невалидна заявка." }
    await sql`UPDATE et_questions SET status = ${status}, updated_at = now() WHERE id = ANY(${clean}::int[])`
    await audit(`question.${status}`, "question", clean.join(","), { count: clean.length })
    revalidatePath(`${BASE}/questions`)
    return { ok: true, message: `Обновени въпроси: ${clean.length}.` }
  })
}

export async function deleteQuestion(id: number) {
  return guard(async () => {
    if (!validId(id)) return { ok: false, error: "Невалиден въпрос." }
    // Attempts keep immutable snapshots (FK is ON DELETE SET NULL), so past results stay intact.
    const [, deleted] = await sql.transaction([
      sql`DELETE FROM et_test_questions WHERE question_id = ${id}`,
      sql`DELETE FROM et_questions WHERE id = ${id} RETURNING id`,
    ])
    if (deleted.length === 0) return { ok: false, error: "Въпросът не е намерен." }
    await audit("question.delete", "question", id)
    revalidatePath(`${BASE}/questions`)
    revalidatePath(`${BASE}/tests`)
    return { ok: true, message: "Въпросът е изтрит." }
  })
}

/* ---------------- Tests ---------------- */

export async function saveTest(id: number | null, raw: Record<string, unknown>) {
  return guard<{ id: number }>(async () => {
    const parsed = validateTest(raw)
    if (!parsed.ok) return { ok: false, errors: parsed.errors }
    const t = parsed.data
    if (t.selectionMethod === "manual" && t.questionIds.length) {
      const [found] = await sql`SELECT count(*)::int AS n FROM et_questions WHERE id = ANY(${t.questionIds}::int[]) AND status <> 'archived'`
      if (found.n !== t.questionIds.length) return { ok: false, errors: { questionIds: "Някои избрани въпроси не съществуват или са архивирани." } }
    }
    const values = {
      config: JSON.stringify(t.selectionConfig),
      settings: JSON.stringify(t.settings),
      questions: t.selectionMethod === "manual" ? t.questionIds : [],
    }

    let testId: number
    if (id === null) {
      const [row] = await sql`
        INSERT INTO et_tests (title, description, test_type, level_id, duration_minutes, question_count, selection_method,
          selection_config, settings, available_from, available_until)
        VALUES (${t.title}, ${t.description}, ${t.testType}, ${t.levelId}, ${t.durationMinutes}, ${Math.max(t.questionCount, 1)},
          ${t.selectionMethod}, ${values.config}::jsonb, ${values.settings}::jsonb, ${t.availableFrom}, ${t.availableUntil})
        RETURNING id
      `
      testId = row.id
      await sql`
        INSERT INTO et_test_questions (test_id, question_id, display_order)
        SELECT ${testId}, q.id, q.ord FROM unnest(${values.questions}::int[]) WITH ORDINALITY AS q(id, ord)
      `
      await audit("test.create", "test", testId, { title: t.title })
    } else {
      if (!validId(id)) return { ok: false, error: "Невалиден тест." }
      const expected = Number(raw.expectedVersion)
      if (!Number.isInteger(expected) || expected < 1) return { ok: false, error: "Липсва версия на теста. Презаредете страницата." }
      testId = id
      const [before] = await sql`SELECT * FROM et_tests WHERE id = ${id}`
      if (!before) return { ok: false, error: "Тестът не е намерен." }
      if (before.edit_version !== expected) return { ok: false, error: CONFLICT_MESSAGE }
      const beforeQuestions = (await sql`SELECT question_id FROM et_test_questions WHERE test_id = ${id} ORDER BY display_order, id`).map(
        (r) => r.question_id as number,
      )

      try {
        // One transaction: lock the row, abort (division by zero) if another admin saved meanwhile, then write everything.
        // Attempts keep their own snapshots, so none of this touches started or finished attempts.
        await sql.transaction([
          sql`SELECT 1 / (CASE WHEN edit_version = ${expected} THEN 1 ELSE 0 END) FROM et_tests WHERE id = ${id} FOR UPDATE`,
          sql`
            UPDATE et_tests SET title = ${t.title}, description = ${t.description}, test_type = ${t.testType}, level_id = ${t.levelId},
              duration_minutes = ${t.durationMinutes}, question_count = ${Math.max(t.questionCount, 1)}, selection_method = ${t.selectionMethod},
              selection_config = ${values.config}::jsonb, settings = ${values.settings}::jsonb,
              available_from = ${t.availableFrom}, available_until = ${t.availableUntil},
              edit_version = edit_version + 1, updated_at = now()
            WHERE id = ${id}
          `,
          sql`DELETE FROM et_test_questions WHERE test_id = ${id}`,
          sql`
            INSERT INTO et_test_questions (test_id, question_id, display_order)
            SELECT ${id}, q.id, q.ord FROM unnest(${values.questions}::int[]) WITH ORDINALITY AS q(id, ord)
          `,
        ])
      } catch (err) {
        if ((err as { code?: string }).code === "22012") return { ok: false, error: CONFLICT_MESSAGE }
        throw err
      }

      const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null)
      const changed = Object.entries({
        title: before.title !== t.title,
        description: before.description !== t.description,
        testType: before.test_type !== t.testType,
        levelId: before.level_id !== t.levelId,
        durationMinutes: before.duration_minutes !== t.durationMinutes,
        questionCount: before.question_count !== Math.max(t.questionCount, 1),
        selectionMethod: before.selection_method !== t.selectionMethod,
        selectionConfig: JSON.stringify(before.selection_config) !== JSON.stringify(JSON.parse(values.config)),
        settings: JSON.stringify(before.settings) !== JSON.stringify(JSON.parse(values.settings)),
        availability: iso(before.available_from) !== iso(t.availableFrom) || iso(before.available_until) !== iso(t.availableUntil),
        questions: beforeQuestions.join(",") !== values.questions.join(","),
      })
        .filter(([, v]) => v)
        .map(([k]) => k)
      await audit("test.update", "test", testId, {
        title: t.title,
        fromVersion: expected,
        toVersion: expected + 1,
        changed,
        questionsAdded: values.questions.filter((q) => !beforeQuestions.includes(q)),
        questionsRemoved: beforeQuestions.filter((q) => !values.questions.includes(q)),
      })
    }

    // A published test must remain startable after edits.
    const [current] = await sql`SELECT * FROM et_tests WHERE id = ${testId}`
    if (current.status === "published") {
      const check = await resolveQuestionIds(current as TestRow)
      if (!check.ok) {
        await sql`UPDATE et_tests SET status = 'unpublished', updated_at = now() WHERE id = ${testId}`
        await audit("test.auto_unpublish", "test", testId, { reason: check.error })
        revalidatePath(BASE, "layout")
        return { ok: true, data: { id: testId }, message: `Запазено, но тестът е скрит: ${check.error}` }
      }
    }
    revalidatePath(BASE, "layout")
    return { ok: true, data: { id: testId }, message: "Тестът е запазен." }
  })
}

export async function setTestStatus(id: number, status: TestStatus) {
  return guard(async () => {
    if (!validId(id) || !TEST_STATUSES.includes(status)) return { ok: false, error: "Невалидна заявка." }
    const [test] = await sql`SELECT * FROM et_tests WHERE id = ${id}`
    if (!test) return { ok: false, error: "Тестът не е намерен." }

    if (status === "published") {
      const check = await resolveQuestionIds(test as TestRow)
      if (!check.ok) return { ok: false, error: `Тестът не може да бъде публикуван: ${check.error}` }
      if (test.test_type === "placement") {
        const [rule] = await sql`SELECT 1 FROM et_placement_rules WHERE test_id = ${id} LIMIT 1`
        if (!rule) return { ok: false, error: "Входящият тест изисква конфигурирани правила за определяне на ниво." }
      }
      const incomplete = await sql`
        SELECT q.id FROM et_test_questions tq JOIN et_questions q ON q.id = tq.question_id
        WHERE tq.test_id = ${id} AND NOT EXISTS (SELECT 1 FROM et_question_options o WHERE o.question_id = q.id AND o.is_correct)
        LIMIT 1
      `
      if (incomplete[0]) return { ok: false, error: "Има въпроси без маркиран верен отговор." }
    }

    await sql`UPDATE et_tests SET status = ${status}, updated_at = now() WHERE id = ${id}`
    await audit("test.status", "test", id, { from: test.status, to: status })
    revalidatePath(BASE, "layout")
    revalidatePath("/testove", "layout")
    return { ok: true, message: "Статусът е обновен." }
  })
}

export async function savePlacementRules(testId: number, raw: unknown) {
  return guard<{ version: number }>(async () => {
    if (!validId(testId)) return { ok: false, error: "Невалиден тест." }
    const levels = await sql`SELECT id, name FROM et_levels ORDER BY display_order, id`
    const parsed = validatePlacementRules(raw, new Map(levels.map((l) => [l.id as number, l.name as string])))
    if (!parsed.ok) return { ok: false, errors: parsed.errors }
    if (parsed.data.levels.length === 0) return { ok: false, errors: { levels: "Добавете поне едно ниво." } }

    // Order by level display order so evaluation is always lowest → highest.
    const order = new Map(levels.map((l, i) => [l.id as number, i]))
    const config = { ...parsed.data, levels: [...parsed.data.levels].sort((a, b) => order.get(a.levelId)! - order.get(b.levelId)!) }

    // Rules are versioned, never overwritten: finished attempts keep pointing to the version they were graded with.
    const [row] = await sql`
      INSERT INTO et_placement_rules (test_id, rule_configuration, version)
      SELECT ${testId}, ${JSON.stringify(config)}::jsonb, coalesce(max(version), 0) + 1 FROM et_placement_rules WHERE test_id = ${testId}
      RETURNING version
    `
    await audit("placement_rules.update", "test", testId, { version: row.version })
    revalidatePath(BASE, "layout")
    return { ok: true, data: { version: row.version }, message: `Правилата са запазени (версия ${row.version}).` }
  })
}

export async function saveLevelDefaults(raw: unknown) {
  return guard(async () => {
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) return { ok: false, error: "Няма стойности за запазване." }
    const items: { levelId: number; minPercent: number; minQuestions: number }[] = []
    for (const entry of raw) {
      const o = (entry ?? {}) as Record<string, unknown>
      const levelId = Number(o.levelId)
      const minPercent = Number(o.minPercent)
      const minQuestions = Number(o.minQuestions)
      if (!validId(levelId)) return { ok: false, error: "Невалидно ниво." }
      if (!Number.isInteger(minPercent) || minPercent < 1 || minPercent > 100) return { ok: false, error: "Прагът трябва да е цяло число от 1 до 100." }
      if (!Number.isInteger(minQuestions) || minQuestions < 1 || minQuestions > 100) return { ok: false, error: "Минималният брой въпроси трябва да е от 1 до 100." }
      items.push({ levelId, minPercent, minQuestions })
    }
    for (const it of items) {
      await sql`UPDATE et_levels SET default_min_percent = ${it.minPercent}, default_min_questions = ${it.minQuestions} WHERE id = ${it.levelId}`
    }
    await audit("levels.defaults_update", "level", items[0].levelId, { items })
    revalidatePath(BASE, "layout")
    return { ok: true, message: "Стойностите по подразбиране са запазени." }
  })
}

/* ---------------- Results & students ---------------- */

export async function grantRetake(studentId: number, testId: number, extraAttempts: number, reason: string) {
  return guard(async () => {
    if (!validId(studentId) || !validId(testId)) return { ok: false, error: "Невалидна заявка." }
    const extra = Number(extraAttempts)
    if (!Number.isInteger(extra) || extra < 1 || extra > 10) return { ok: false, error: "Броят опити трябва да е от 1 до 10." }
    const cleanReason = String(reason ?? "").trim().slice(0, 500)
    await sql`
      INSERT INTO et_retake_grants (student_id, test_id, extra_attempts, reason) VALUES (${studentId}, ${testId}, ${extra}, ${cleanReason || null})
    `
    await audit("retake.grant", "student", studentId, { testId, extra, reason: cleanReason })
    revalidatePath(BASE, "layout")
    return { ok: true, message: "Разрешен е нов опит." }
  })
}

export async function addAdminNote(attemptId: string, note: string) {
  return guard(async () => {
    const text = String(note ?? "").trim()
    if (!/^[0-9a-f-]{36}$/i.test(attemptId) || !text || text.length > 2000) return { ok: false, error: "Въведете бележка (до 2000 символа)." }
    await sql`INSERT INTO et_admin_notes (attempt_id, note) VALUES (${attemptId}::uuid, ${text})`
    await audit("attempt.note", "attempt", attemptId)
    revalidatePath(`${BASE}/results/${attemptId}`)
    return { ok: true, message: "Бележката е добавена." }
  })
}

export async function setStudentStatus(studentId: number, status: "active" | "disabled") {
  return guard(async () => {
    if (!validId(studentId) || !["active", "disabled"].includes(status)) return { ok: false, error: "Невалидна заявка." }
    await sql`UPDATE et_students SET status = ${status}, updated_at = now() WHERE id = ${studentId}`
    if (status === "disabled") await revokeAllStudentSessions(studentId)
    await audit(`student.${status}`, "student", studentId)
    revalidatePath(`${BASE}/students`)
    return { ok: true, message: status === "disabled" ? "Профилът е деактивиран." : "Профилът е активиран." }
  })
}

/**
 * Administrator-assisted recovery: after verifying the parent's identity offline,
 * the admin generates a single-use link valid for 24 hours. Only the hash is stored.
 */
export async function createPasswordResetLink(studentId: number) {
  return guard<{ url: string }>(async () => {
    if (!validId(studentId)) return { ok: false, error: "Невалиден ученик." }
    const [student] = await sql`SELECT id FROM et_students WHERE id = ${studentId}`
    if (!student) return { ok: false, error: "Ученикът не е намерен." }
    const token = generateToken()
    await sql`UPDATE et_password_reset_tokens SET used_at = now() WHERE student_id = ${studentId} AND used_at IS NULL`
    await sql`
      INSERT INTO et_password_reset_tokens (student_id, token_hash, expires_at)
      VALUES (${studentId}, ${hashToken(token)}, now() + interval '24 hours')
    `
    await audit("student.reset_link", "student", studentId)
    const h = await headers()
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? ""
    const proto = h.get("x-forwarded-proto") ?? "https"
    return { ok: true, data: { url: `${proto}://${host}/testove/nova-parola?token=${token}` } }
  })
}

export async function dismissRecoveryRequest(id: number) {
  return guard(async () => {
    if (!validId(id)) return { ok: false, error: "Невалидна заявка." }
    await sql`UPDATE et_recovery_requests SET status = 'dismissed', resolved_at = now() WHERE id = ${id}`
    revalidatePath(`${BASE}/students`)
    return { ok: true }
  })
}
