export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string;
  total_rosters: number;
  roster_positions: string[];
  scoring_settings: Record<string, number>;
  settings: Record<string, number>;
  draft_id: string | null;
  previous_league_id: string | null;
}

export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata?: { team_name?: string } | null;
}

export interface SleeperRosterSettings {
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  fpts_decimal?: number;
  fpts_against: number;
  fpts_against_decimal?: number;
  waiver_budget_used?: number;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  co_owners?: string[] | null;
  players: string[] | null;
  starters: string[] | null;
  reserve?: string[] | null;
  taxi?: string[] | null;
  settings: SleeperRosterSettings;
}

export interface SleeperPlayer {
  player_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  position?: string | null;
  team?: string | null;
  status?: string | null;
  injury_status?: string | null;
  injury_body_part?: string | null;
  years_exp?: number | null;
  age?: number | null;
  fantasy_positions?: string[] | null;
  search_rank?: number | null;
}

export type SleeperPlayersMap = Record<string, SleeperPlayer>;

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number | null;
  points: number;
  players: string[];
  starters: string[];
  players_points?: Record<string, number>;
}

export interface SleeperNflState {
  week: number;
  season: string;
  season_type: string;
  leg: number;
}

export interface SleeperDraftPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  pick_no: number;
}

export interface SleeperTradedPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}

export interface SleeperTrendingPlayer {
  player_id: string;
  count: number;
}
