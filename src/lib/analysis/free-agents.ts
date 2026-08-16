import { getPlayers, getRosters } from "@/lib/sleeper/api";
import type { SleeperPlayer } from "@/lib/sleeper/types";

const RELEVANT_POSITIONS = new Set(["QB", "RB", "WR", "TE", "K", "DEF"]);

export interface FreeAgent {
  playerId: string;
  player: SleeperPlayer;
}

export async function getFreeAgents(leagueId: string): Promise<FreeAgent[]> {
  const [players, rosters] = await Promise.all([
    getPlayers(),
    getRosters(leagueId),
  ]);

  const rosteredIds = new Set(rosters.flatMap((r) => r.players ?? []));

  const agents: FreeAgent[] = [];
  for (const [playerId, player] of Object.entries(players)) {
    if (rosteredIds.has(playerId)) continue;
    if (!player.position || !RELEVANT_POSITIONS.has(player.position)) continue;
    if (player.position !== "DEF" && !player.team) continue;
    agents.push({ playerId, player });
  }

  agents.sort((a, b) => {
    const rankA = a.player.search_rank ?? Number.MAX_SAFE_INTEGER;
    const rankB = b.player.search_rank ?? Number.MAX_SAFE_INTEGER;
    return rankA - rankB;
  });

  return agents;
}
