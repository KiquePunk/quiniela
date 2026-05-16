import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Team, Group } from '../models/team.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtiene todos los equipos
   */
  getAllTeams(): Observable<Team[]> {
    return from(
      this.supabaseService.client
        .from('teams')
        .select('*')
        .order('name', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Team[];
        })
    );
  }

  /**
   * Obtiene equipos por grupo
   */
  getTeamsByGroup(groupName: string): Observable<Team[]> {
    return from(
      this.supabaseService.client
        .from('teams')
        .select('*')
        .eq('group_name', groupName)
        .order('name', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Team[];
        })
    );
  }

  /**
   * Obtiene un equipo por ID
   */
  getTeamById(teamId: number): Observable<Team | null> {
    return from(
      this.supabaseService.client
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Team | null;
        })
    );
  }

  /**
   * Obtiene todos los grupos con sus equipos
   */
  getAllGroups(): Observable<Group[]> {
    return from(
      this.supabaseService.client
        .from('teams')
        .select('*')
        .order('group_name', { ascending: true })
        .then(({ data, error }) => {
          if (error) throw error;
          
          const teams = data as Team[];
          const groupsMap = new Map<string, Team[]>();

          teams.forEach(team => {
            if (team.group) {
              if (!groupsMap.has(team.group)) {
                groupsMap.set(team.group, []);
              }
              groupsMap.get(team.group)!.push(team);
            }
          });

          const groups: Group[] = Array.from(groupsMap.entries()).map(([name, teams]) => ({
            name,
            teams
          }));

          return groups;
        })
    );
  }
}

// Made with Bob