import { BaseAPI } from './base';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  currency?: string;
  country?: string;
  user_type: 'free' | 'plus' | 'pro';
  project_count: number;
  storage_used: number;
  notification_settings: {
    projectUpdates: boolean;
    paymentReminders: boolean;
    milestoneUpdates: boolean;
    marketing: boolean;
  };
  created_at?: string;
  updated_at: string;
}

export class ProfileAPI extends BaseAPI<Profile> {
  constructor() {
    super('profiles', '*');
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Not authenticated', data: undefined };
    }
    
    return this.findById(user.id);
  }

  /**
   * Update current user profile
   */
  async updateCurrentProfile(data: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Not authenticated', data: undefined };
    }
    
    return this.update(user.id, data);
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, settings: Partial<Profile['notification_settings']>) {
    const profile = await this.findById(userId);
    
    if (profile.error || !profile.data) {
      return profile;
    }
    
    return this.update(userId, {
      notification_settings: {
        ...profile.data.notification_settings,
        ...settings
      }
    });
  }

  /**
   * Increment project count
   */
  async incrementProjectCount(userId: string, increment: number = 1) {
    return this.executeRaw<Profile>(
      (supabase) => supabase.rpc('increment_project_count', {
        user_id: userId,
        increment_value: increment
      })
    );
  }

  /**
   * Update storage usage
   */
  async updateStorageUsage(userId: string, bytes: number) {
    return this.executeRaw<Profile>(
      (supabase) => supabase.rpc('update_storage_usage', {
        user_id: userId,
        bytes_used: bytes
      })
    );
  }

  /**
   * Check user limits
   */
  async checkLimits(userId: string): Promise<{
    canCreateProject: boolean;
    canUploadFile: boolean;
    projectsRemaining: number;
    storageRemaining: number;
  }> {
    const profile = await this.findById(userId);
    
    if (profile.error || !profile.data) {
      return {
        canCreateProject: false,
        canUploadFile: false,
        projectsRemaining: 0,
        storageRemaining: 0
      };
    }

    // Get plan limits
    const limits = await supabase
      .from('user_plan_limits')
      .select('*')
      .eq('user_type', profile.data.user_type)
      .single();

    if (limits.error || !limits.data) {
      return {
        canCreateProject: false,
        canUploadFile: false,
        projectsRemaining: 0,
        storageRemaining: 0
      };
    }

    const projectsRemaining = limits.data.project_limit - profile.data.project_count;
    const storageRemaining = limits.data.storage_limit_bytes - profile.data.storage_used;

    return {
      canCreateProject: projectsRemaining > 0,
      canUploadFile: storageRemaining > 0,
      projectsRemaining: Math.max(0, projectsRemaining),
      storageRemaining: Math.max(0, storageRemaining)
    };
  }

  /**
   * Get profile with subscription info
   */
  async getWithSubscription(userId: string) {
    return this.executeRaw<Profile & { subscription?: any }>(
      (supabase) => supabase
        .from(this.tableName)
        .select(`
          *,
          subscriptions(*)
        `)
        .eq('id', userId)
        .single()
    );
  }
}