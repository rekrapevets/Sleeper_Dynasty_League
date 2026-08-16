import { getLeague, getNflState, getPlayers, getRosters, getUsers } from "@/lib/sleeper/api";
import type { SleeperPlayer } from "@/lib/sleeper/types";
import { isByeWeek } from "@/lib/nfl-byes";
import { formatPoints, teamName } from "@/lib/format";

export interface RosterSlot {
  slotLabel: string;
  playerId: string;
  player: SleeperPlayer | null;
  isBye: boolean;
}

export interface MyTeamData {
  teamName: string;
  record: { wins: number; losses: number; ties: number };
  points: string;
  week: number;
  starters: RosterSlot[];
  bench: RosterSlot[];
  ir: RosterSlot[];
}

export async function getMyTeam(
  leagueId: string,
  userId: string
): Promise<MyTeamData | null> {
  const [league, users, rosters, players, nflState] = await Promise.all([
    getLeague(leagueId),
    getUsers(leagueId),
    getRosters(leagueId),
    getPlayers(),
    getNflState(),
  ]);

  const roster = rosters.find((r) => r.owner_id === userId);
  if (!roster) return null;

  const owner = users.find((u) => u.user_id === userId);
  const week = nflState.week;

  const starterSlotLabels = league.roster_positions.filter(
    (p) => p !== "BN" && p !== "IR" && p !== "TAXI"
  );
  const starterIds = roster.starters ?? [];

  const toSlot = (playerId: string, slotLabel: string): RosterSlot => {
    const player = players[playerId] ?? null;
    return {
      slotLabel,
      playerId,
      player,
      isBye: isByeWeek(player?.team, week),
    };
  };

  const starters = starterIds.map((id, i) =>
    toSlot(id, starterSlotLabels[i] ?? "FLEX")
  );

  const reserveIds = new Set(roster.reserve ?? []);
  const taxiIds = new Set(roster.taxi ?? []);
  const starterIdSet = new Set(starterIds);

  const bench = (roster.players ?? [])
    .filter(
      (id) =>
        !starterIdSet.has(id) && !reserveIds.has(id) && !taxiIds.has(id)
    )
    .map((id) => toSlot(id, "BN"));

  const ir = [...reserveIds].map((id) => toSlot(id, "IR"));

  return {
    teamName: teamName(owner),
    record: {
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      ties: roster.settings.ties,
    },
    points: formatPoints(roster.settings.fpts, roster.settings.fpts_decimal),
    week,
    starters,
    bench,
    ir,
  };
}
