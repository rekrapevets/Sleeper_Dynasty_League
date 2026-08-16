import { sleeperFetch } from "./client";
import type {
  SleeperDraftPick,
  SleeperLeague,
  SleeperMatchup,
  SleeperNflState,
  SleeperPlayersMap,
  SleeperRoster,
  SleeperTradedPick,
  SleeperTrendingPlayer,
  SleeperUser,
} from "./types";

export function getLeague(leagueId: string) {
  return sleeperFetch<SleeperLeague>(`/league/${leagueId}`, 300);
}

export function getUsers(leagueId: string) {
  return sleeperFetch<SleeperUser[]>(`/league/${leagueId}/users`, 300);
}

export function getRosters(leagueId: string) {
  return sleeperFetch<SleeperRoster[]>(`/league/${leagueId}/rosters`, 300);
}

/**
 * Full NFL player dictionary (~20MB — too large for Next's data cache, which
 * caps entries at 2MB). Held in an in-memory module cache instead, refreshed
 * once a day per warm server instance.
 */
let playersCache: { data: SleeperPlayersMap; fetchedAt: number } | null = null;
const PLAYERS_TTL_MS = 24 * 60 * 60 * 1000;

export async function getPlayers(): Promise<SleeperPlayersMap> {
  if (playersCache && Date.now() - playersCache.fetchedAt < PLAYERS_TTL_MS) {
    return playersCache.data;
  }
  const res = await fetch("https://api.sleeper.app/v1/players/nfl", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Sleeper API error ${res.status} for /players/nfl`);
  }
  const data = (await res.json()) as SleeperPlayersMap;
  playersCache = { data, fetchedAt: Date.now() };
  return data;
}

export function getMatchups(leagueId: string, week: number) {
  return sleeperFetch<SleeperMatchup[]>(
    `/league/${leagueId}/matchups/${week}`,
    300
  );
}

export function getNflState() {
  return sleeperFetch<SleeperNflState>(`/state/nfl`, 3600);
}

export function getTrending(type: "add" | "drop" = "add") {
  return sleeperFetch<SleeperTrendingPlayer[]>(
    `/players/nfl/trending/${type}`,
    3600
  );
}

export function getDraftPicks(draftId: string) {
  return sleeperFetch<SleeperDraftPick[]>(`/draft/${draftId}/picks`, 3600);
}

export function getTradedPicks(leagueId: string) {
  return sleeperFetch<SleeperTradedPick[]>(
    `/league/${leagueId}/traded_picks`,
    3600
  );
}
