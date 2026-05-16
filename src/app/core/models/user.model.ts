export type UserRole = 'admin' | 'participant';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_points?: number;
  role: UserRole;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  is_active: boolean;
  deactivated_at?: string;
  deactivated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  total_points: number;
  rank: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  full_name: string;
}

// Made with Bob
