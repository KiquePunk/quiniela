import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Match, MatchWithTeams } from '../models/match.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService
  ) {}

  /**
   * Obtiene todos los partidos con información de equipos
   */
  getAllMatches(): Observable<MatchWithTeams[]> {
    return from(
      this.supabaseService.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .order('utc_date', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as MatchWithTeams[];
        })
    );
  }

  /**
   * Obtiene partidos por fase
   */
  getMatchesByStage(stage: string): Observable<MatchWithTeams[]> {
    return from(
      this.supabaseService.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('stage', stage)
        .order('utc_date', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as MatchWithTeams[];
        })
    );
  }

  /**
   * Obtiene partidos por grupo
   */
  getMatchesByGroup(group: string): Observable<MatchWithTeams[]> {
    return from(
      this.supabaseService.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('group_name', group)
        .order('utc_date', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as MatchWithTeams[];
        })
    );
  }

  /**
   * Obtiene un partido específico
   */
  getMatchById(matchId: number): Observable<MatchWithTeams> {
    return from(
      this.supabaseService.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('id', matchId)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as MatchWithTeams;
        })
    );
  }

  /**
   * Obtiene partidos próximos (no finalizados)
   */
  getUpcomingMatches(): Observable<MatchWithTeams[]> {
    return from(
      this.supabaseService.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .in('status', ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED'])
        .order('utc_date', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as MatchWithTeams[];
        })
    );
  }

  /**
   * Obtiene partidos finalizados
   */
  getFinishedMatches(): Observable<MatchWithTeams[]> {
    return from(
      this.supabaseService.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('status', 'FINISHED')
        .order('utc_date', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as MatchWithTeams[];
        })
    );
  }

  /**
   * Sincroniza partidos desde la API de football-data.org
   */
  syncMatches(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync/matches`, {});
  }

  /**
   * Actualiza resultados de partidos desde la API
   */
  updateMatchResults(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync/results`, {});
  }
}

// Made with Bob