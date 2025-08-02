import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/shared';

export interface AuthResult {
  data?: {
    user: User | null;
    session?: any;
  };
  error?: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  options?: {
    data?: {
      name?: string;
      currency?: string;
      country?: string;
    };
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currency?: string;
  country?: string;
  avatar_url?: string;
  company?: string;
  phone?: string;
}

export interface IAuthService {
  // Authentication methods
  login(email: string, password: string): Promise<AuthResult>;
  signUp(data: SignUpData): Promise<AuthResult>;
  logout(): Promise<{ error?: string }>;
  refreshAuth(): Promise<AuthResult>;
  resetPassword(email: string): Promise<{ error?: string }>;
  updatePassword(password: string): Promise<{ error?: string }>;
  
  // Profile methods
  getProfile(userId: string): Promise<{ data?: Profile; error?: string }>;
  updateProfile(userId: string, data: UpdateProfileData): Promise<{ data?: Profile; error?: string }>;
  uploadAvatar(userId: string, file: File): Promise<{ data?: string; error?: string }>;
  
  // Session methods
  getCurrentUser(): Promise<{ data?: User; error?: string }>;
  getSession(): Promise<{ data?: any; error?: string }>;
  
  // Auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void): () => void;
}