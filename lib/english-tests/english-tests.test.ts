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

  it("is inconclusive with too few answers or no tested level", () => {
    expect(estimatePlacement(rules, {}, 1).reason).toBe("insufficient_total")
    expect(estimatePlacement(rules, {}, 4)).toMatchObject({ levelName: null, conclusive: false, reason: "insufficient_level_evidence" })
  })

  it("skips levels without enough questions", () => {
    const out = estimatePlacement(rules, { 1: { questions: 2, earned: 2, max: 2 }, 2: { questions: 1, earned: 1, max: 1 } }, 4)
    expect(out).toMatchObject({ levelName: "A1", conclusive: true, reason: "placed" })
  })

  it("reports missing rules", () => {
    expect(estimatePlacement(null, {}, 10).reason).toBe("no_rules")
  })
})

describe("score band placement", () => {
  const names = ["A1", "A2", "B1", "B2", "C1", "C2"]
  const starts = [0, 30, 50, 65, 80, 92]
  const rules = {
    mode: "score_bands",
    minTotalAnswered: 5,
    levels: names.map((levelName, i) => ({ levelId: i + 1, levelName, minPercent: starts[i], minQuestions: 1 })),
  } as PlacementRuleConfig

  it("places by the teacher's overall score ranges", () => {
    expect(estimatePlacement(rules, {}, 30, 10).levelName).toBe("A1")
    expect(estimatePlacement(rules, {}, 30, 30).levelName).toBe("A2")
    expect(estimatePlacement(rules, {}, 30, 67).levelName).toBe("B2")
    expect(estimatePlacement(rules, {}, 30, 100)).toMatchObject({ levelName: "C2", conclusive: true, mode: "score_bands" })
  })

  it("uses explicit from–to ranges and leaves gaps unplaced", () => {
    const ranged = {
      mode: "score_bands",
      minTotalAnswered: 0,
      levels: [
        { levelId: 1, levelName: "A1", minPercent: 0, maxPercent: 40, minQuestions: 1 },
        { levelId: 2, levelName: "A2", minPercent: 41, maxPercent: 70, minQuestions: 1 },
        { levelId: 3, levelName: "B1", minPercent: 80, maxPercent: 100, minQuestions: 1 },
      ],
    } as PlacementRuleConfig
    expect(estimatePlacement(ranged, {}, 10, 40.9).levelName).toBe("A1")
    expect(estimatePlacement(ranged, {}, 10, 41).levelName).toBe("A2")
    expect(estimatePlacement(ranged, {}, 10, 75).levelName).toBeNull()
    expect(estimatePlacement(ranged, {}, 10, 100).levelName).toBe("B1")
  })

  it("respects a raised lowest band and the answered minimum", () => {
    const raised = { ...rules, levels: rules.levels.map((l, i) => (i === 0 ? { ...l, minPercent: 20 } : l)) }
    expect(estimatePlacement(raised, {}, 30, 10).reason).toBe("below_lowest_level")
    expect(estimatePlacement(rules, {}, 2, 90).reason).toBe("insufficient_total")
  })
})

describe("seven-level placement (Pre-A1 to C2)", () => {
  const names = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]
  const rules = {
    minTotalAnswered: 30,
    levels: names.map((levelName, i) => ({ levelId: i + 1, levelName, minPercent: 70, minQuestions: 6 })),
  } as PlacementRuleConfig
  const stats = (earnedPerLevel: number[]) =>
    Object.fromEntries(earnedPerLevel.map((earned, i) => [i + 1, { questions: 6, earned, max: 6 }]))

  it("grades C1 and C2 questions into their own level buckets", () => {
    const questions = names.flatMap((_, level) =>
      Array.from({ length: 6 }, (_, k) => q(level * 10 + k + 1, level + 1, [1000 + level * 10 + k])),
    )
    const answers = new Map(questions.filter((x) => x.levelId !== 7 || x.attemptQuestionId % 2 === 0).map((x) => [x.attemptQuestionId, x.correctOptionIds]))
    const result = gradeAttempt(questions, answers)
    expect(result.maxScore).toBe(42)
    expect(result.perLevel[6]).toEqual({ questions: 6, earned: 6, max: 6 })
    expect(result.perLevel[7]).toEqual({ questions: 6, earned: 3, max: 6 })
  })

  it("awards C1 or C2 only after every lower level is passed", () => {
    expect(estimatePlacement(rules, stats([6, 6, 6, 6, 6, 5, 3]), 42).levelName).toBe("C1")
    expect(estimatePlacement(rules, stats([6, 6, 6, 6, 6, 6, 6]), 42).levelName).toBe("C2")
  })

  it("does not award C1/C2 from a high overall score when a lower level fails", () => {
    const out = estimatePlacement(rules, stats([6, 6, 6, 6, 2, 6, 6]), 42)
    expect(out).toMatchObject({ levelName: "B1", conclusive: true })
  })

  it("stops at the highest tested level when C1/C2 were not tested enough", () => {
    const perLevel = { ...stats([6, 6, 6, 6, 6]), 6: { questions: 2, earned: 2, max: 2 } }
    const out = estimatePlacement(rules, perLevel, 32)
    expect(out).toMatchObject({ levelName: "B2", conclusive: true, reason: "placed" })
  })

  it("places a student even when Pre-A1 has no questions in the test", () => {
    const perLevel = {
      2: { questions: 6, earned: 6, max: 6 },
      3: { questions: 6, earned: 5, max: 6 },
      4: { questions: 6, earned: 4, max: 6 },
      5: { questions: 2, earned: 1, max: 2 },
    }
    expect(estimatePlacement(rules, perLevel, 30)).toMatchObject({ levelName: "A2", conclusive: true })
  })

  it("allocates six questions per level across all seven levels", () => {
    const pool: PoolQuestion[] = Array.from({ length: 70 }, (_, i) => ({ id: i + 1, levelId: (i % 7) + 1, difficulty: "medium" }))
    const allocations = names.map((_, i) => ({ levelId: i + 1, percent: i < 6 ? 14 : 16 }))
    const res = selectRandomQuestions(pool, { levelIds: [], difficulties: [], allocations } as SelectionConfig, 42)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(new Set(res.ids).size).toBe(42)
      for (let level = 1; level <= 7; level++) {
        expect(res.ids.filter((id) => pool[id - 1].levelId === level)).toHaveLength(level < 7 ? 6 : 6)
      }
    }
  })

  it("rejects allocations when C2 has too few questions", () => {
    const pool: PoolQuestion[] = Array.from({ length: 40 }, (_, i) => ({ id: i + 1, levelId: (i % 7) + 1, difficulty: "medium" }))
    const allocations = names.map((_, i) => ({ levelId: i + 1, percent: i < 6 ? 14 : 16 }))
    expect(selectRandomQuestions(pool, { levelIds: [], difficulties: [], allocations } as SelectionConfig, 42).ok).toBe(false)
  })
})

describe("selectRandomQuestions", () => {
  const pool: PoolQuestion[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    levelId: (i % 3) + 1,
    difficulty: "medium",
  }))
  const base: SelectionConfig = { levelIds: [], difficulties: [], allocations: [] } as SelectionConfig

  it("returns unique questions of the requested count", () => {
    const res = selectRandomQuestions(pool, base, 8)
    expect(res.ok).toBe(true)
    if (res.ok) expect(new Set(res.ids).size).toBe(8)
  })

  it("rejects percentages above 100%", () => {
    expect(selectRandomQuestions(pool, { ...base, allocations: [{ levelId: 1, percent: 60 }, { levelId: 2, percent: 50 }] }, 5).ok).toBe(false)
  })

  it("respects per-level percentages", () => {
    const res = selectRandomQuestions(pool, { ...base, allocations: [{ levelId: 1, percent: 40 }, { levelId: 2, percent: 60 }] }, 5)
    expect(res.ok).toBe(true)
    if (res.ok) {
      const levels = res.ids.map((id) => pool.find((p) => p.id === id)!.levelId)
      expect(levels.filter((l) => l === 1)).toHaveLength(2)
      expect(levels.filter((l) => l === 2)).toHaveLength(3)
    }
  })

  it("fails clearly when the bank is too small", () => {
    expect(selectRandomQuestions(pool, { ...base, levelIds: [1] }, 10).ok).toBe(false)
    expect(selectRandomQuestions(pool, { ...base, allocations: [{ levelId: 1, percent: 100 }] }, 9).ok).toBe(false)
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
