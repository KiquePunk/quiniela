import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { LoginCredentials, RegisterData, User } from '../models/user.model';
import { BehaviorSubject, Observable, from, map, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userProfileSubject = new BehaviorSubject<User | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  get currentUser$(): Observable<any> {
    return this.supabaseService.currentUser$.pipe(
      tap((authUser) => {
        if (!authUser) {
          this.userProfileSubject.next(null);
        }
      })
    );
  }

  get isAuthenticated(): boolean {
    return this.supabaseService.currentUser !== null;
  }

  login(credentials: LoginCredentials): Observable<any> {
    return from(this.supabaseService.signIn(credentials.email, credentials.password)).pipe(
      switchMap((result: any) => {
        const userId = result.user?.id;
        if (!userId) {
          return of(result);
        }

        return from(this.getUserProfile(userId)).pipe(
          tap((profile) => this.userProfileSubject.next(profile)),
          map(() => result)
        );
      })
    );
  }

  register(data: RegisterData): Observable<any> {
    return from(
      this.supabaseService.signUp(data.email, data.password, {
        username: data.username,
        full_name: data.full_name
      })
    ).pipe(
      tap(() => this.userProfileSubject.next(null))
    );
  }

  logout(): Observable<void> {
    return from(this.supabaseService.signOut()).pipe(
      map(() => {
        this.userProfileSubject.next(null);
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
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    if (this.supabaseService.currentUser?.id === userId) {
      this.userProfileSubject.next(data);
    }

    return data;
  }

  loadCurrentUserProfile(): Observable<User | null> {
    const currentUser = this.supabaseService.currentUser;

    if (!currentUser) {
      this.userProfileSubject.next(null);
      return of(null);
    }

    return from(this.getUserProfile(currentUser.id)).pipe(
      tap((profile) => this.userProfileSubject.next(profile))
    );
  }

  get currentUserProfile(): User | null {
    return this.userProfileSubject.value;
  }

  get isAdmin(): boolean {
    return this.userProfileSubject.value?.role === 'admin';
  }

  get isApprovedParticipant(): boolean {
    const profile = this.userProfileSubject.value;
    return !!profile && profile.is_approved && profile.is_active;
  }

  get isActiveParticipant(): boolean {
    return !!this.userProfileSubject.value?.is_active;
  }

}

// Made with Bob
