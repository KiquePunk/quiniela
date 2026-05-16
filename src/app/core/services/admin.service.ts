import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';

export interface ExportPredictionRow {
  prediction_id: string;
  prediction_created_at: string;
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  is_approved: boolean;
  is_active: boolean;
  match_id: number;
  utc_date: string;
  stage: string;
  matchday?: number;
  group_name?: string;
  home_team_name: string;
  away_team_name: string;
  predicted_home_score: number;
  predicted_away_score: number;
  actual_home_score?: number;
  actual_away_score?: number;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private supabaseService: SupabaseService) {}

  getUsers(): Observable<User[]> {
    return from(
      this.supabaseService.client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as User[];
        })
    );
  }

  approveUser(userId: string, approvedBy: string): Observable<User> {
    return from(
      this.supabaseService.client
        .from('users')
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', userId)
        .select('*')
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as User;
        })
    );
  }

  deactivateUser(userId: string, deactivatedBy: string): Observable<User> {
    return from(
      this.supabaseService.client
        .from('users')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
          deactivated_by: deactivatedBy
        })
        .eq('id', userId)
        .select('*')
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as User;
        })
    );
  }

  reactivateUser(userId: string): Observable<User> {
    return from(
      this.supabaseService.client
        .from('users')
        .update({
          is_active: true,
          deactivated_at: null,
          deactivated_by: null
        })
        .eq('id', userId)
        .select('*')
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as User;
        })
    );
  }

  getPredictionsExport(): Observable<ExportPredictionRow[]> {
    return from(
      this.supabaseService.client
        .from('predictions_export')
        .select('*')
        .order('utc_date', { ascending: true })
        .order('username', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as ExportPredictionRow[];
        })
    );
  }

  downloadPredictionsCsv(): Observable<void> {
    return this.getPredictionsExport().pipe(
      map((rows) => {
        const headers = [
          'Usuario',
          'Nombre completo',
          'Email',
          'Rol',
          'Aprobado',
          'Activo',
          'Fecha partido',
          'Etapa',
          'Jornada',
          'Grupo',
          'Local',
          'Visitante',
          'Pronóstico local',
          'Pronóstico visitante',
          'Marcador local',
          'Marcador visitante',
          'Puntos'
        ];

        const csvRows = rows.map((row) => [
          row.username,
          row.full_name,
          row.email,
          row.role,
          row.is_approved ? 'Sí' : 'No',
          row.is_active ? 'Sí' : 'No',
          new Date(row.utc_date).toLocaleString('es-MX'),
          row.stage,
          row.matchday ?? '',
          row.group_name ?? '',
          row.home_team_name,
          row.away_team_name,
          row.predicted_home_score,
          row.predicted_away_score,
          row.actual_home_score ?? '',
          row.actual_away_score ?? '',
          row.points ?? 0
        ]);

        const csvContent = [headers, ...csvRows]
          .map((line) =>
            line
              .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
              .join(',')
          )
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];

        link.href = url;
        link.setAttribute('download', `pronosticos-quiniela-${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
    );
  }
}

// Made with Bob