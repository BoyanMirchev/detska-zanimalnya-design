import type { LevelAllocation } from "./types"

/**
 * Converts per-level percentages into whole question counts for a test of
 * `total` questions (largest-remainder rounding). When the percentages add up
 * to 100 the counts add up to exactly `total`.
 */
export function percentsToCounts(allocations: readonly LevelAllocation[], total: number) {
  const positive = allocations.filter((a) => a.percent > 0)
  const percentTotal = positive.reduce((sum, a) => sum + a.percent, 0)
  const target = Math.round((total * Math.min(percentTotal, 100)) / 100)
  const counts = positive.map((a) => {
    const exact = (total * a.percent) / 100
    return { levelId: a.levelId, count: Math.floor(exact), frac: exact - Math.floor(exact) }
  })
  let missing = target - counts.reduce((sum, c) => sum + c.count, 0)
  for (const c of [...counts].sort((a, b) => b.frac - a.frac)) {
    if (missing <= 0) break
    c.count++
    missing--
  }
  return counts.map(({ levelId, count }) => ({ levelId, count }))
}
