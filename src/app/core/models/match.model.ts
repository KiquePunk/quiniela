import { Team } from './team.model';

export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED';
export type MatchStage =
  | 'GROUP_STAGE'
  | 'LAST_32'
  | 'LAST_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Match {
  id: number;
  utc_date: string;
  status: MatchStatus;
  stage: MatchStage;
  matchday?: number;
  group?: string;
  home_team_id: number;
  away_team_id: number;
  home_team?: Team;
  away_team?: Team;
  home_score?: number;
  away_score?: number;
  venue?: string;
  is_locked: boolean;
}

export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
}

// Made with Bob
