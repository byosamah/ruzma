import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ErrorHandler } from './ErrorHandler';
import { validators } from '@/lib/utils/validation';
import { logSecurityEvent } from '@/lib/utils/securityLogger';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  business_name?: string;
  business_number?: string;
  vat_number?: string;
  address?: string;
  user_type: 'free' | 'plus' | 'pro';
  project_count: number;
  storage_used: number;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  redirectTo?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class UserManagementService {
  private static instance: UserManagementService;

  private constructor() {}

  static getInstance(): UserManagementService {
    if (!this.instance) {
      this.instance = new UserManagementService();
    }
    return this.instance;
  }

  // Authentication methods
  async signUp(data: SignUpData): Promise<{ user: User | null; error: any }> {
    try {
      // Validate email
      if (!validators.isEmail(data.email)) {
        throw new Error('Invalid email address');
      }

      // Validate password
      const passwordValidation = validators.isValidPassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      const sanitizedEmail = validators.sanitizeEmail(data.email);

      const { data: authData, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName || '',
          },
          emailRedirectTo: data.redirectTo
        }
      });

      if (error) {
        throw error;
      }

      if (authData.user) {
        logSecurityEvent('user_signup', { userId: authData.user.id });
      }

      return { user: authData.user, error: null };
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.signUp');
      return { user: null, error };
    }
  }

  async signIn(data: SignInData): Promise<{ user: User | null; error: any }> {
    try {
      const sanitizedEmail = validators.sanitizeEmail(data.email);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: data.password
      });

      if (error) {
        throw error;
      }

      if (authData.user) {
        logSecurityEvent('user_signin', { userId: authData.user.id });
      }

      return { user: authData.user, error: null };
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.signIn');
      return { user: null, error };
    }
  }

  async signOut(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        logSecurityEvent('user_signout', { userId: user.id });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.signOut');
    }
  }

  async resetPassword(email: string, redirectTo?: string): Promise<boolean> {
    try {
      const sanitizedEmail = validators.sanitizeEmail(email);

      const { error } = await supabase.auth.resetPasswordForEmail(
        sanitizedEmail,
        { redirectTo }
      );

      if (error) {
        throw error;
      }

      logSecurityEvent('password_reset_requested', { email: sanitizedEmail });
      toast.success('Password reset email sent');
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.resetPassword');
      return false;
    }
  }

  // Profile management methods
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.getProfile', {
        showToast: false
      });
      return null;
    }
  }

  async createOrUpdateProfile(
    userId: string,
    email: string,
    metadata?: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const profileData: Partial<UserProfile> = {
        id: userId,
        email: validators.sanitizeEmail(email),
        user_type: 'free',
        project_count: 0,
        storage_used: 0,
        ...metadata,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logSecurityEvent('profile_updated', { userId });
      return data;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.createOrUpdateProfile');
      return null;
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      // Remove readonly fields
      const { id, email, created_at, ...safeUpdates } = updates;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...safeUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logSecurityEvent('profile_updated', { userId });
      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.updateProfile');
      return null;
    }
  }

  // User metadata management
  async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) {
        throw error;
      }

      logSecurityEvent('user_metadata_updated', { userId });
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.updateUserMetadata');
      return false;
    }
  }

  // Utility methods
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.getCurrentUser', {
        showToast: false
      });
      return null;
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const sanitizedEmail = validators.sanitizeEmail(email);

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !!data;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.checkEmailExists', {
        showToast: false
      });
      return false;
    }
  }

  // Session management
  async refreshSession(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'UserManagementService.refreshSession', {
        showToast: false
      });
      return false;
    }
  }
}

// Export singleton instance
export const userManagementService = UserManagementService.getInstance();