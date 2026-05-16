import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { LoginCredentials, RegisterData, User } from '../models/user.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  get currentUser$(): Observable<any> {
    return this.supabaseService.currentUser$;
  }

  get isAuthenticated(): boolean {
    return this.supabaseService.currentUser !== null;
  }

  login(credentials: LoginCredentials): Observable<any> {
    return from(this.supabaseService.signIn(credentials.email, credentials.password));
  }

  register(data: RegisterData): Observable<any> {
    return from(
      this.supabaseService.signUp(data.email, data.password, {
        username: data.username,
        full_name: data.full_name
      })
    );
  }

  logout(): Observable<void> {
    return from(this.supabaseService.signOut()).pipe(
      map(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }
}

// Made with Bob
