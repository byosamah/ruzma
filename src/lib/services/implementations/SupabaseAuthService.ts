import { SupabaseClient } from '@supabase/supabase-js';
import {
  IAuthService,
  AuthResult,
  SignUpData,
  UpdateProfileData,
} from '../interfaces/IAuthService';
import { Profile } from '@/types/shared';

export class SupabaseAuthService implements IAuthService {
  constructor(private supabase: SupabaseClient) {}

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  }

  async signUp(signUpData: SignUpData): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp(signUpData);

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Sign up failed' };
    }
  }

  async logout(): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Logout failed' };
    }
  }

  async refreshAuth(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Auth refresh failed' };
    }
  }

  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Password reset failed' };
    }
  }

  async updatePassword(password: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({ password });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Password update failed' };
    }
  }

  async getProfile(userId: string): Promise<{ data?: Profile; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Profile fetch failed' };
    }
  }

  async updateProfile(
    userId: string,
    profileData: UpdateProfileData
  ): Promise<{ data?: Profile; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Profile update failed' };
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<{ data?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        return { error: uploadError.message };
      }

      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { data: urlData.publicUrl };
    } catch (error: any) {
      return { error: error.message || 'Avatar upload failed' };
    }
  }

  async getCurrentUser(): Promise<{ data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error) {
        return { error: error.message };
      }

      return { data: data.user };
    } catch (error: any) {
      return { error: error.message || 'Get current user failed' };
    }
  }

  async getSession(): Promise<{ data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        return { error: error.message };
      }

      return { data: data.session };
    } catch (error: any) {
      return { error: error.message || 'Get session failed' };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(callback);
    
    return () => {
      subscription.unsubscribe();
    };
  }
}