import { randomInt } from "node:crypto"
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
  if (config.levelIds.length && !config.levelIds.includes(q.levelId)) return false
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
  const allocations = config.allocations.filter((a) => a.count > 0)
  const allocated = allocations.reduce((sum, a) => sum + a.count, 0)

  if (allocated > count) {
    return { ok: false, error: `Разпределението по нива (${allocated}) надвишава броя въпроси (${count}).` }
  }

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
      eligible.filter((q) => !chosen.has(q.id) && (allocations.length === 0 || !allocatedLevels.has(q.levelId))),
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
