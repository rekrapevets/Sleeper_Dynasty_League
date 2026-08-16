import { getMatchups, getNflState, getRosters } from "@/lib/sleeper/api";
import type { SleeperPlayer } from "@/lib/sleeper/types";
import type { RosterSlot } from "@/lib/analysis/team";
import { getMyTeam } from "@/lib/analysis/team";

const FLEX_ELIGIBILITY: Record<string, string[]> = {
  FLEX: ["RB", "WR", "TE"],
  WRRB_FLEX: ["RB", "WR"],
  REC_FLEX: ["WR", "TE"],
  SUPER_FLEX: ["QB", "RB", "WR", "TE"],
};

function eligiblePositions(slotLabel: string): string[] {
  return FLEX_ELIGIBILITY[slotLabel] ?? [slotLabel];
}

/** Discount applied to recent scoring average for a shakier injury designation. */
const RISK_WEIGHT: Record<string, number> = {
  Questionable: 0.85,
  Doubtful: 0.4,
};

const SIT_STATUSES = new Set(["Out", "Doubtful", "IR", "PUP", "Suspended", "NA"]);

export interface StartSitSuggestion {
  outSlotLabel: string;
  outPlayer: SleeperPlayer;
  inPlayer: SleeperPlayer;
  reason: string;
}

export interface StartSitResult {
  week: number;
  weeksConsidered: number;
  suggestions: StartSitSuggestion[];
}

function averageOf(values?: number[]): number {
  if (!values || values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getStartSitSuggestions(
  leagueId: string,
  userId: string
): Promise<StartSitResult> {
  const [team, nflState, rosters] = await Promise.all([
    getMyTeam(leagueId, userId),
    getNflState(),
    getRosters(leagueId),
  ]);

  if (!team) return { week: 0, weeksConsidered: 0, suggestions: [] };

  const week = nflState.week;
  const roster = rosters.find((r) => r.owner_id === userId);
  const rosterId = roster?.roster_id;

  const lookbackWeeks: number[] = [];
  for (let w = Math.max(1, week - 3); w < week; w++) lookbackWeeks.push(w);

  const pointsByPlayer = new Map<string, number[]>();
  if (rosterId != null && lookbackWeeks.length > 0) {
    const matchupWeeks = await Promise.all(
      lookbackWeeks.map((w) => getMatchups(leagueId, w))
    );
    for (const weekMatchups of matchupWeeks) {
      const mine = weekMatchups.find((m) => m.roster_id === rosterId);
      if (!mine?.players_points) continue;
      for (const [playerId, pts] of Object.entries(mine.players_points)) {
        const list = pointsByPlayer.get(playerId) ?? [];
        list.push(pts);
        pointsByPlayer.set(playerId, list);
      }
    }
  }

  function score(slot: RosterSlot): number {
    const status = slot.player?.injury_status ?? undefined;
    if (slot.isBye || (status && SIT_STATUSES.has(status))) return -1;
    const avg = averageOf(pointsByPlayer.get(slot.playerId));
    const riskFactor = status ? (RISK_WEIGHT[status] ?? 1) : 1;
    return avg * riskFactor;
  }

  const suggestions: StartSitSuggestion[] = [];
  const usedBenchIds = new Set<string>();

  for (const starterSlot of team.starters) {
    if (!starterSlot.player) continue;
    const starterScore = score(starterSlot);
    const eligible = eligiblePositions(starterSlot.slotLabel);
    const forcedSit = starterScore < 0;

    let best: { playerId: string; player: SleeperPlayer } | null = null;
    let bestScore = -Infinity;

    for (const benchSlot of team.bench) {
      if (!benchSlot.player || usedBenchIds.has(benchSlot.playerId)) continue;
      const pos = benchSlot.player.position;
      if (!pos || !eligible.includes(pos)) continue;
      const benchScore = score(benchSlot);
      if (benchScore > bestScore) {
        bestScore = benchScore;
        best = { playerId: benchSlot.playerId, player: benchSlot.player };
      }
    }

    if (!best) continue;

    const worthwhileSwap = forcedSit
      ? bestScore > starterScore
      : bestScore > starterScore + 1;

    if (!worthwhileSwap) continue;

    usedBenchIds.add(best.playerId);
    const reason = forcedSit
      ? starterSlot.isBye
        ? "On bye this week"
        : `Injury status: ${starterSlot.player.injury_status}`
      : `Higher recent scoring average (${bestScore.toFixed(1)} vs ${starterScore.toFixed(1)})`;

    suggestions.push({
      outSlotLabel: starterSlot.slotLabel,
      outPlayer: starterSlot.player,
      inPlayer: best.player,
      reason,
    });
  }

  return { week, weeksConsidered: lookbackWeeks.length, suggestions };
}
