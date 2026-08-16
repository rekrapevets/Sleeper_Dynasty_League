import type { SleeperPlayer } from "@/lib/sleeper/types";

/**
 * Heuristic, directional dynasty trade values — not real market data (Sleeper
 * has none). Based on current relevance (search_rank), position scarcity, and
 * experience. Treat as a rough starting point for a trade conversation, not
 * an authoritative valuation.
 */
const POSITION_MULTIPLIER: Record<string, number> = {
  RB: 1.1,
  WR: 1.0,
  TE: 0.85,
  QB: 0.8,
  K: 0.2,
  DEF: 0.2,
};

function experienceMultiplier(yearsExp: number | null | undefined): number {
  if (yearsExp == null) return 1;
  if (yearsExp <= 1) return 1.15;
  if (yearsExp <= 3) return 1.05;
  if (yearsExp <= 6) return 0.95;
  if (yearsExp <= 9) return 0.75;
  return 0.55;
}

export function playerTradeValue(player: SleeperPlayer): number {
  const rank = player.search_rank ?? 4000;
  const base = Math.max(0, 800 - rank * 0.8);
  const posMult = player.position
    ? (POSITION_MULTIPLIER[player.position] ?? 0.7)
    : 0.7;
  const expMult = experienceMultiplier(player.years_exp);
  return Math.round(base * posMult * expMult);
}

const ROUND_BASE_VALUE: Record<number, number> = {
  1: 400,
  2: 220,
  3: 120,
  4: 60,
  5: 30,
};

export function pickTradeValue(
  round: number,
  season: string,
  currentSeason: number
): number {
  const base = ROUND_BASE_VALUE[round] ?? 15;
  const yearsOut = Math.max(0, parseInt(season, 10) - currentSeason);
  const discount = Math.pow(0.85, yearsOut);
  return Math.round(base * discount);
}
