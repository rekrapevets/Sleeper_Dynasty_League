import type { SleeperRoster, SleeperUser } from "@/lib/sleeper/types";
import { formatPoints, teamName } from "@/lib/format";

export interface PlayoffSeed {
  seed: number;
  rosterId: number;
  teamName: string;
  isMe: boolean;
  wins: number;
  losses: number;
  ties: number;
  points: string;
  bye: boolean;
  clinchedVia: "record" | "points";
}

const RECORD_SEEDS = 4;
const POINTS_SEEDS = 2;
const BYE_SEEDS = 2;

function pointsValue(r: SleeperRoster): number {
  return r.settings.fpts + (r.settings.fpts_decimal ?? 0) / 100;
}

/**
 * Dynasty Legends by-laws, Section I.5: top 4 seeds are the best records;
 * seeds 5-6 are the two teams with the most Points For among the remaining
 * teams. Top 2 seeds get a bye in round 1.
 */
export function getPlayoffSeeding(
  rosters: SleeperRoster[],
  usersById: Map<string, SleeperUser>,
  myUserId: string
): PlayoffSeed[] {
  const byRecord = [...rosters].sort((a, b) => {
    if (b.settings.wins !== a.settings.wins) return b.settings.wins - a.settings.wins;
    return pointsValue(b) - pointsValue(a);
  });

  const topByRecord = byRecord.slice(0, RECORD_SEEDS);
  const remaining = byRecord.slice(RECORD_SEEDS);
  const wildcardByPoints = [...remaining]
    .sort((a, b) => pointsValue(b) - pointsValue(a))
    .slice(0, POINTS_SEEDS);

  const seeded = [
    ...topByRecord.map((r) => ({ roster: r, via: "record" as const })),
    ...wildcardByPoints.map((r) => ({ roster: r, via: "points" as const })),
  ];

  return seeded.map(({ roster: r, via }, i) => {
    const seed = i + 1;
    const owner = r.owner_id ? usersById.get(r.owner_id) : undefined;
    return {
      seed,
      rosterId: r.roster_id,
      teamName: teamName(owner),
      isMe: r.owner_id === myUserId,
      wins: r.settings.wins,
      losses: r.settings.losses,
      ties: r.settings.ties,
      points: formatPoints(r.settings.fpts, r.settings.fpts_decimal),
      bye: seed <= BYE_SEEDS,
      clinchedVia: via,
    };
  });
}
