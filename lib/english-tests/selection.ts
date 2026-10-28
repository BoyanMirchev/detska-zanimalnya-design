import { randomInt } from "node:crypto"
import { percentsToCounts } from "./allocation"
import type { SelectionConfig } from "./types"

export type PoolQuestion = { id: number; levelId: number | null; difficulty: string }

export type RandomFn = (maxExclusive: number) => number

const cryptoRandom: RandomFn = (max) => randomInt(max)

export function shuffle<T>(items: readonly T[], random: RandomFn = cryptoRandom): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = random(i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function matchesFilters(q: PoolQuestion, config: SelectionConfig) {
  if (config.levelIds.length && (q.levelId == null || !config.levelIds.includes(q.levelId))) return false
  if (config.difficulties.length && !config.difficulties.includes(q.difficulty as never)) return false
  return true
}

export type SelectionResult = { ok: true; ids: number[] } | { ok: false; error: string }

/**
 * Picks `count` questions from the eligible pool. Per-level allocations are
 * filled first; any remainder is drawn from the rest of the filtered pool.
 */
export function selectRandomQuestions(
  pool: PoolQuestion[],
  config: SelectionConfig,
  count: number,
  random: RandomFn = cryptoRandom,
): SelectionResult {
  const eligible = pool.filter((q) => matchesFilters(q, config))
  const percentTotal = config.allocations.reduce((sum, a) => sum + Math.max(0, a.percent), 0)
  if (percentTotal > 100) {
    return { ok: false, error: `Сборът от процентите по нива (${percentTotal}%) надвишава 100%.` }
  }
  const allocations = percentsToCounts(config.allocations, count).filter((a) => a.count > 0)

  const chosen = new Set<number>()
  for (const allocation of allocations) {
    const candidates = shuffle(
      eligible.filter((q) => q.levelId === allocation.levelId && !chosen.has(q.id)),
      random,
    )
    if (candidates.length < allocation.count) {
      return {
        ok: false,
        error: `Няма достатъчно въпроси за избраното ниво (нужни ${allocation.count}, налични ${candidates.length}).`,
      }
    }
    candidates.slice(0, allocation.count).forEach((q) => chosen.add(q.id))
  }

  const remainder = count - chosen.size
  if (remainder > 0) {
    const allocatedLevels = new Set(allocations.map((a) => a.levelId))
    // With full per-level allocations the remainder must not skew the configured distribution.
    const rest = shuffle(
      eligible.filter((q) => !chosen.has(q.id) && (allocations.length === 0 || q.levelId == null || !allocatedLevels.has(q.levelId))),
      random,
    )
    if (rest.length < remainder) {
      return {
        ok: false,
        error: `Няма достатъчно подходящи въпроси в банката (нужни ${count}, налични ${chosen.size + rest.length}).`,
      }
    }
    rest.slice(0, remainder).forEach((q) => chosen.add(q.id))
  }

  return { ok: true, ids: [...chosen] }
}
