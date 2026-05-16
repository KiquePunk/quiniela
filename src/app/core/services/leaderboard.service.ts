import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LeaderboardEntry } from '../models/prediction.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtiene el ranking completo de usuarios
   */
  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return from(
      this.supabaseService.client
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as LeaderboardEntry[];
        })
    );
  }

  /**
   * Obtiene el top N usuarios
   */
  getTopUsers(limit: number = 10): Observable<LeaderboardEntry[]> {
    return from(
      this.supabaseService.client
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(limit)
        .then(({ data, error }) => {
          if (error) throw error;
          return data as LeaderboardEntry[];
        })
    );
  }

  /**
   * Obtiene la posición de un usuario específico
   */
  getUserRank(userId: string): Observable<LeaderboardEntry | null> {
    return from(
      this.supabaseService.client
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as LeaderboardEntry | null;
        })
    );
  }

  /**
   * Obtiene usuarios cercanos en el ranking
   */
  getNearbyUsers(userId: string, range: number = 5): Observable<LeaderboardEntry[]> {
    return this.getUserRank(userId).pipe(
      switchMap((userRank) => {
        if (!userRank) {
          return from(Promise.resolve([] as LeaderboardEntry[]));
        }

        return from(
          this.supabaseService.client
            .from('leaderboard')
            .select('*')
            .gte('rank', Math.max(1, userRank.rank - range))
            .lte('rank', userRank.rank + range)
            .order('rank', { ascending: true })
            .then(({ data, error }) => {
              if (error) throw error;
              return data as LeaderboardEntry[];
            })
        );
      })
    );
  }
}

// Made with Bob