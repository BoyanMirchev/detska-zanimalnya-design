import { describe, expect, it } from "vitest"
import { estimatePlacement, gradeAttempt, type GradableQuestion } from "./grading"
import { selectRandomQuestions, type PoolQuestion } from "./selection"
import { validatePassword, validateUsername } from "./validation"
import type { PlacementRuleConfig, SelectionConfig } from "./types"

const q = (id: number, levelId: number, correct: number[], type: GradableQuestion["type"] = "single"): GradableQuestion => ({
  attemptQuestionId: id,
  type,
  points: 1,
  levelId,
  correctOptionIds: correct,
})

describe("gradeAttempt", () => {
  it("scores correct, incorrect and unanswered questions", () => {
    const result = gradeAttempt(
      [q(1, 1, [10]), q(2, 1, [20]), q(3, 2, [30])],
      new Map([
        [1, [10]],
        [2, [21]],
      ]),
    )
    expect(result.correct).toBe(1)
    expect(result.incorrect).toBe(1)
    expect(result.unanswered).toBe(1)
    expect(result.score).toBe(1)
    expect(result.percentage).toBeCloseTo(33.33)
    expect(result.perLevel[1]).toEqual({ questions: 2, earned: 1, max: 2 })
  })

  it("uses all-or-nothing scoring for multiple-answer questions", () => {
    const questions = [q(1, 1, [1, 2], "multiple")]
    expect(gradeAttempt(questions, new Map([[1, [1]]])).score).toBe(0)
    expect(gradeAttempt(questions, new Map([[1, [1, 2, 3]]])).score).toBe(0)
    expect(gradeAttempt(questions, new Map([[1, [2, 1]]])).score).toBe(1)
  })

  it("ignores duplicate selections", () => {
    expect(gradeAttempt([q(1, 1, [5])], new Map([[1, [5, 5]]])).correct).toBe(1)
  })
})

describe("estimatePlacement", () => {
  const rules: PlacementRuleConfig = {
    minTotalAnswered: 4,
    levels: [
      { levelId: 1, levelName: "A1", minPercent: 70, minQuestions: 2 },
      { levelId: 2, levelName: "A2", minPercent: 70, minQuestions: 2 },
    ],
  } as PlacementRuleConfig

  it("awards the highest consecutively passed level", () => {
    const out = estimatePlacement(rules, { 1: { questions: 2, earned: 2, max: 2 }, 2: { questions: 2, earned: 1, max: 2 } }, 4)
    expect(out).toMatchObject({ levelName: "A1", conclusive: true, reason: "placed" })
  })

  it("never skips an unpassed lower level", () => {
    const out = estimatePlacement(rules, { 1: { questions: 2, earned: 0, max: 2 }, 2: { questions: 2, earned: 2, max: 2 } }, 4)
    expect(out).toMatchObject({ levelName: null, reason: "below_lowest_level" })
  })

  it("is inconclusive with too few answers or too little level evidence", () => {
    expect(estimatePlacement(rules, {}, 1).reason).toBe("insufficient_total")
    const out = estimatePlacement(rules, { 1: { questions: 2, earned: 2, max: 2 }, 2: { questions: 1, earned: 1, max: 1 } }, 4)
    expect(out).toMatchObject({ levelName: "A1", conclusive: false, reason: "insufficient_level_evidence" })
  })

  it("reports missing rules", () => {
    expect(estimatePlacement(null, {}, 10).reason).toBe("no_rules")
  })
})

describe("selectRandomQuestions", () => {
  const pool: PoolQuestion[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    levelId: (i % 3) + 1,
    categoryId: 1,
    difficulty: "medium",
  }))
  const base: SelectionConfig = { levelIds: [], categoryIds: [], difficulties: [], allocations: [] } as SelectionConfig

  it("returns unique questions of the requested count", () => {
    const res = selectRandomQuestions(pool, base, 8)
    expect(res.ok).toBe(true)
    if (res.ok) expect(new Set(res.ids).size).toBe(8)
  })

  it("respects per-level allocations", () => {
    const res = selectRandomQuestions(pool, { ...base, allocations: [{ levelId: 1, count: 2 }, { levelId: 2, count: 3 }] }, 5)
    expect(res.ok).toBe(true)
    if (res.ok) {
      const levels = res.ids.map((id) => pool.find((p) => p.id === id)!.levelId)
      expect(levels.filter((l) => l === 1)).toHaveLength(2)
      expect(levels.filter((l) => l === 2)).toHaveLength(3)
    }
  })

  it("fails clearly when the bank is too small", () => {
    expect(selectRandomQuestions(pool, { ...base, levelIds: [1] }, 10).ok).toBe(false)
    expect(selectRandomQuestions(pool, { ...base, allocations: [{ levelId: 1, count: 9 }] }, 5).ok).toBe(false)
  })
})

describe("credential validation", () => {
  it("validates usernames", () => {
    expect(validateUsername("boyan.mirchev")).toBeNull()
    expect(validateUsername("ab")).toBeNull()
    expect(validateUsername("мария")).toBeNull()
    expect(validateUsername("")).not.toBeNull()
  })

  it("validates passwords", () => {
    expect(validatePassword("short1")).not.toBeNull()
    expect(validatePassword("onlyletters")).not.toBeNull()
    expect(validatePassword("maria2015x", "maria")).not.toBeNull()
    expect(validatePassword("Sunny2026day", "maria")).toBeNull()
  })
})
