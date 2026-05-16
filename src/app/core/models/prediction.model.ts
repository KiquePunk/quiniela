export interface Prediction {
  id?: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PredictionWithMatch extends Prediction {
  match: {
    id: number;
    utc_date: string;
    status: string;
    home_team: {
      name: string;
      crest: string;
    };
    away_team: {
      name: string;
      crest: string;
    };
    home_score?: number;
    away_score?: number;
  };
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
  correct_scores: number;
  correct_results: number;
}

// Made with Bob
