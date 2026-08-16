import { getLeagueTeams } from "@/lib/analysis/league";
import { getLeague } from "@/lib/sleeper/api";
import { playerTradeValue, pickTradeValue } from "@/lib/analysis/trade-value";
import { playerName } from "@/lib/player-display";
import type { SleeperPlayer } from "@/lib/sleeper/types";
import type { RosterSlot } from "@/lib/analysis/team";

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

    const pickAssets: TradeAsset[] = team.futurePicks.map((pick) => ({
      key: `pick-${pick.season}-${pick.round}-${team.rosterId}`,
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
