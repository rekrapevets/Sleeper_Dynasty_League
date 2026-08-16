import {
  getLeague,
  getNflState,
  getPlayers,
  getRosters,
  getTradedPicks,
  getUsers,
} from "@/lib/sleeper/api";
import type { SleeperLeague } from "@/lib/sleeper/types";
import { isByeWeek } from "@/lib/nfl-byes";
import { formatPoints, teamName } from "@/lib/format";
import type { RosterSlot } from "@/lib/analysis/team";

export interface FuturePick {
  season: string;
  round: number;
}

export interface TeamOverview {
  rosterId: number;
  ownerId: string | null;
  teamName: string;
  record: { wins: number; losses: number; ties: number };
  points: string;
  starters: RosterSlot[];
  bench: RosterSlot[];
  futurePicks: FuturePick[];
}

async function getFutureDraftPickOwners(
  leagueId: string,
  league: SleeperLeague
): Promise<Map<number, FuturePick[]>> {
  const tradedPicks = await getTradedPicks(leagueId);
  const rounds = league.settings.draft_rounds ?? 4;
  const totalRosters = league.total_rosters;
  const currentSeason = parseInt(league.season, 10);

  const seasons = new Set<string>([String(currentSeason + 1)]);
  for (const tp of tradedPicks) seasons.add(tp.season);

  const tradeMap = new Map<string, number>();
  for (const tp of tradedPicks) {
    tradeMap.set(`${tp.season}-${tp.round}-${tp.roster_id}`, tp.owner_id);
  }

  const picksByOwner = new Map<number, FuturePick[]>();
  for (const season of [...seasons].sort()) {
    for (let round = 1; round <= rounds; round++) {
      for (let rosterId = 1; rosterId <= totalRosters; rosterId++) {
        const owner =
          tradeMap.get(`${season}-${round}-${rosterId}`) ?? rosterId;
        const list = picksByOwner.get(owner) ?? [];
        list.push({ season, round });
        picksByOwner.set(owner, list);
      }
    }
  }

  return picksByOwner;
}

export async function getLeagueTeams(leagueId: string): Promise<TeamOverview[]> {
  const [league, users, rosters, players, nflState] = await Promise.all([
    getLeague(leagueId),
    getUsers(leagueId),
    getRosters(leagueId),
    getPlayers(),
    getNflState(),
  ]);

  const picksByOwner = await getFutureDraftPickOwners(leagueId, league);

  const usersById = new Map(users.map((u) => [u.user_id, u]));
  const week = nflState.week;
  const starterSlotLabels = league.roster_positions.filter(
    (p) => p !== "BN" && p !== "IR" && p !== "TAXI"
  );

  const teams = rosters.map((roster): TeamOverview => {
    const owner = roster.owner_id ? usersById.get(roster.owner_id) : undefined;
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

    const starterIdSet = new Set(starterIds);
    const reserveIds = new Set(roster.reserve ?? []);
    const taxiIds = new Set(roster.taxi ?? []);
    const bench = (roster.players ?? [])
      .filter(
        (id) =>
          !starterIdSet.has(id) && !reserveIds.has(id) && !taxiIds.has(id)
      )
      .map((id) => toSlot(id, "BN"));

    const futurePicks = (picksByOwner.get(roster.roster_id) ?? []).sort(
      (a, b) => (a.season === b.season ? a.round - b.round : a.season.localeCompare(b.season))
    );

    return {
      rosterId: roster.roster_id,
      ownerId: roster.owner_id,
      teamName: teamName(owner),
      record: {
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        ties: roster.settings.ties,
      },
      points: formatPoints(roster.settings.fpts, roster.settings.fpts_decimal),
      starters,
      bench,
      futurePicks,
    };
  });

  return teams.sort((a, b) => a.teamName.localeCompare(b.teamName));
}
