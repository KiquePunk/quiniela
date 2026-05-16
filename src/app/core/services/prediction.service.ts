import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Prediction, PredictionWithMatch } from '../models/prediction.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtiene todas las predicciones del usuario actual
   */
  getUserPredictions(userId: string): Observable<PredictionWithMatch[]> {
    return from(
      this.supabaseService.client
        .from('predictions')
        .select(`
          *,
          match:matches(
            id,
            utc_date,
            status,
            home_score,
            away_score,
            home_team:teams!matches_home_team_id_fkey(name, crest),
            away_team:teams!matches_away_team_id_fkey(name, crest)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as any[];
        })
    );
  }

  /**
   * Obtiene la predicción del usuario para un partido específico
   */
  getUserPredictionForMatch(userId: string, matchId: number): Observable<Prediction | null> {
    return from(
      this.supabaseService.client
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Prediction | null;
        })
    );
  }

  /**
   * Crea una nueva predicción
   */
  createPrediction(prediction: Omit<Prediction, 'id' | 'created_at' | 'updated_at' | 'points'>): Observable<Prediction> {
    return from(
      this.supabaseService.client
        .from('predictions')
        .insert(prediction)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Prediction;
        })
    );
  }

  /**
   * Actualiza una predicción existente
   */
  updatePrediction(
    predictionId: string,
    updates: { home_score: number; away_score: number }
  ): Observable<Prediction> {
    return from(
      this.supabaseService.client
        .from('predictions')
        .update(updates)
        .eq('id', predictionId)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Prediction;
        })
    );
  }

  /**
   * Elimina una predicción
   */
  deletePrediction(predictionId: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('predictions')
        .delete()
        .eq('id', predictionId)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  /**
   * Guarda o actualiza una predicción (upsert)
   */
  savePrediction(
    userId: string,
    matchId: number,
    homeScore: number,
    awayScore: number
  ): Observable<Prediction> {
    return from(
      this.supabaseService.client
        .from('predictions')
        .upsert(
          {
            user_id: userId,
            match_id: matchId,
            home_score: homeScore,
            away_score: awayScore
          },
          {
            onConflict: 'user_id,match_id'
          }
        )
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Prediction;
        })
    );
  }

  /**
   * Obtiene todas las predicciones para un partido específico
   */
  getPredictionsForMatch(matchId: number): Observable<Prediction[]> {
    return from(
      this.supabaseService.client
        .from('predictions')
        .select('*')
        .eq('match_id', matchId)
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Prediction[];
        })
    );
  }

  /**
   * Verifica si el usuario puede hacer predicciones para un partido
   */
  canMakePrediction(matchDate: string, matchStatus: string, isLocked: boolean): boolean {
    if (isLocked || matchStatus === 'FINISHED') {
      return false;
    }

    const matchTime = new Date(matchDate).getTime();
    const now = new Date().getTime();

    // No se puede predecir si el partido ya comenzó
    return matchTime > now;
  }
}

// Made with Bob