import type { PlacementRuleConfig, QuestionType } from "./types"

export type GradableQuestion = {
  attemptQuestionId: number
  type: QuestionType
  points: number
  levelId: number
  correctOptionIds: number[]
}

export type QuestionGrade = {
  attemptQuestionId: number
  answered: boolean
  isCorrect: boolean
  earnedPoints: number
}

export type LevelStats = { questions: number; earned: number; max: number }

export type GradeResult = {
  perQuestion: QuestionGrade[]
  totalQuestions: number
  answered: number
  correct: number
  incorrect: number
  unanswered: number
  score: number
  maxScore: number
  percentage: number
  perLevel: Record<number, LevelStats>
}

function sameSet(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

/**
 * Pure grading function. Multiple-answer questions use explicit all-or-nothing
 * scoring: full points only when the selected set exactly equals the correct set.
 */
export function gradeAttempt(questions: GradableQuestion[], answers: Map<number, number[]>): GradeResult {
  const perQuestion: QuestionGrade[] = []
  const perLevel: Record<number, LevelStats> = {}
  let answered = 0
  let correct = 0
  let score = 0
  let maxScore = 0

  for (const q of questions) {
    const selected = [...new Set(answers.get(q.attemptQuestionId) ?? [])]
    const isAnswered = selected.length > 0
    const isCorrect = isAnswered && q.correctOptionIds.length > 0 && sameSet(selected, q.correctOptionIds)
    const earnedPoints = isCorrect ? q.points : 0

    if (isAnswered) answered++
    if (isCorrect) correct++
    score += earnedPoints
    maxScore += q.points

    const level = (perLevel[q.levelId] ??= { questions: 0, earned: 0, max: 0 })
    level.questions++
    level.earned += earnedPoints
    level.max += q.points

    perQuestion.push({ attemptQuestionId: q.attemptQuestionId, answered: isAnswered, isCorrect, earnedPoints })
  }

  const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 10000) / 100

  return {
    perQuestion,
    totalQuestions: questions.length,
    answered,
    correct,
    incorrect: answered - correct,
    unanswered: questions.length - answered,
    score,
    maxScore,
    percentage,
    perLevel,
  }
}

export type PlacementOutcome = {
  mode?: "score_bands" | "per_level"
  levelName: string | null
  conclusive: boolean
  reason: "placed" | "insufficient_total" | "insufficient_level_evidence" | "below_lowest_level" | "no_rules"
  levels: {
    levelId: number
    levelName: string
    questions: number
    percent: number | null
    minPercent: number
    maxPercent?: number
    enoughQuestions: boolean
    passed: boolean | null
  }[]
}

/**
 * Administrator-configured placement. Levels are evaluated in ascending order and
 * a level is only awarded when every lower configured level was also passed with
 * sufficient evidence — a high score on easy questions can never jump a student
 * to a level they were not tested on.
 */
export function estimatePlacement(
  rules: PlacementRuleConfig | null,
  perLevel: Record<number, LevelStats>,
  answeredTotal: number,
  overallPercent = 0,
): PlacementOutcome {
  if (!rules || rules.levels.length === 0) {
    return { levelName: null, conclusive: false, reason: "no_rules", levels: [] }
  }

  if (rules.mode === "score_bands") return estimateByScoreBands(rules, perLevel, answeredTotal, overallPercent)

  const levels: PlacementOutcome["levels"] = rules.levels.map((rule) => {
    const stats = perLevel[rule.levelId] ?? { questions: 0, earned: 0, max: 0 }
    const percent = stats.max > 0 ? Math.round((stats.earned / stats.max) * 10000) / 100 : null
    const enoughEvidence = stats.questions >= Math.max(1, rule.minQuestions)
    return {
      levelId: rule.levelId,
      levelName: rule.levelName,
      questions: stats.questions,
      percent,
      minPercent: rule.minPercent,
      enoughQuestions: enoughEvidence,
      passed: enoughEvidence ? (percent ?? 0) >= rule.minPercent : null,
    }
  })

  if (answeredTotal < rules.minTotalAnswered) {
    return { levelName: null, conclusive: false, reason: "insufficient_total", levels }
  }

  return { ...resolvePlacementLevel(levels), levels }
}

/**
 * Teacher-defined overall score ranges: the student receives the highest level
 * whose starting percentage is reached by the overall test score.
 */
function estimateByScoreBands(
  rules: PlacementRuleConfig,
  perLevel: Record<number, LevelStats>,
  answeredTotal: number,
  overallPercent: number,
): PlacementOutcome {
  const score = Math.floor(overallPercent)
  const levels: PlacementOutcome["levels"] = rules.levels.map((rule, i) => {
    const max = bandMax(rules.levels, i)
    return {
      levelId: rule.levelId,
      levelName: rule.levelName,
      questions: perLevel[rule.levelId]?.questions ?? 0,
      percent: overallPercent,
      minPercent: rule.minPercent,
      maxPercent: max,
      enoughQuestions: true,
      passed: score >= rule.minPercent && score <= max,
    }
  })

  const mode = "score_bands" as const
  if (answeredTotal < rules.minTotalAnswered) {
    return { mode, levelName: null, conclusive: false, reason: "insufficient_total", levels }
  }

  const achieved = levels.find((l) => l.passed)?.levelName ?? null
  if (!achieved) return { mode, levelName: null, conclusive: true, reason: "below_lowest_level", levels }
  return { mode, levelName: achieved, conclusive: true, reason: "placed", levels }
}

/** Older rule versions only stored a start; their range ends just before the next level. */
export function bandMax(levels: { minPercent: number; maxPercent?: number }[], index: number) {
  const explicit = levels[index].maxPercent
  if (explicit !== undefined) return explicit
  const next = levels[index + 1]
  return next ? Math.max(next.minPercent - 1, levels[index].minPercent) : 100
}

/**
 * Walks the levels in ascending order. Levels the test did not cover with enough
 * questions are skipped, so they neither block nor award a level; the first
 * tested level that is failed stops the climb.
 */
export function resolvePlacementLevel(
  levels: PlacementOutcome["levels"],
): Pick<PlacementOutcome, "levelName" | "conclusive" | "reason"> {
  let achieved: string | null = null
  let anyTested = false
  for (const level of levels) {
    if (level.passed === null) continue
    anyTested = true
    if (!level.passed) break
    achieved = level.levelName
  }

  if (!anyTested) return { levelName: null, conclusive: false, reason: "insufficient_level_evidence" }
  if (!achieved) return { levelName: null, conclusive: true, reason: "below_lowest_level" }
  return { levelName: achieved, conclusive: true, reason: "placed" }
}
