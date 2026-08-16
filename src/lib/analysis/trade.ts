import { getLeagueTeams } from "@/lib/analysis/league";
import { getLeague, getNflState } from "@/lib/sleeper/api";
import { playerTradeValue, pickTradeValue } from "@/lib/analysis/trade-value";
import { playerName } from "@/lib/player-display";
import type { SleeperPlayer } from "@/lib/sleeper/types";
import type { RosterSlot } from "@/lib/analysis/team";

export interface TradeWindow {
  isOpen: boolean;
  week: number;
  playoffWeekStart: number;
}

/** Dynasty Legends by-laws: trading closes from the Monday of the playoffs' first week through the championship. */
export async function getTradeWindow(leagueId: string): Promise<TradeWindow> {
  const [league, nflState] = await Promise.all([
    getLeague(leagueId),
    getNflState(),
  ]);
  const playoffWeekStart = league.settings.playoff_week_start ?? 15;
  return {
    isOpen: nflState.week < playoffWeekStart,
    week: nflState.week,
    playoffWeekStart,
  };
}

export interface TradeAsset {
  key: string;
  label: string;
  sublabel: string;
  value: number;
}

export interface TradeTeam {
  rosterId: number;
  ownerId: string | null;
  teamName: string;
  assets: TradeAsset[];
}

export async function getTradeTeams(leagueId: string): Promise<TradeTeam[]> {
  const [league, teams] = await Promise.all([
    getLeague(leagueId),
    getLeagueTeams(leagueId),
  ]);
  const currentSeason = parseInt(league.season, 10);

  return teams.map((team) => {
    const hasPlayer = (
      slot: RosterSlot
    ): slot is RosterSlot & { player: SleeperPlayer } => slot.player != null;

    const playerAssets: TradeAsset[] = [...team.starters, ...team.bench]
      .filter(hasPlayer)
      .map((slot) => ({
        key: slot.playerId,
        label: playerName(slot.player),
        sublabel: `${slot.player.position ?? ""} · ${slot.player.team ?? "FA"}`,
        value: playerTradeValue(slot.player),
      }));

    const pickAssets: TradeAsset[] = team.futurePicks.map((pick, i) => ({
      key: `pick-${pick.season}-${pick.round}-${team.rosterId}-${i}`,
      label: `${pick.season} Round ${pick.round}`,
      sublabel: "Draft Pick",
      value: pickTradeValue(pick.round, pick.season, currentSeason),
    }));

    return {
      rosterId: team.rosterId,
      ownerId: team.ownerId,
      teamName: team.teamName,
      assets: [...playerAssets, ...pickAssets].sort((a, b) => b.value - a.value),
    };
  });
}
