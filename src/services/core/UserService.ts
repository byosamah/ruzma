import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';

export interface UserLimits {
  projectLimit: number;
  currentProjectCount: number;
  isUnlimited: boolean;
  canCreateProject: boolean;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  currency?: string;
  user_type?: string;
  project_count?: number;
}

export class UserService extends BaseService {
  constructor(user: User | null) {
    super(user);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const user = this.ensureAuthenticated();

    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      this.logOperation('user_profile_fetched');
      return profile;
    } catch (error) {
      return this.handleError(error, 'getUserProfile');
    }
  }

  async getUserLimits(): Promise<UserLimits> {
    const profile = await this.getUserProfile();
    
    if (!profile) {
      throw new Error('User profile not found');
    }

    const userType = profile.user_type || 'free';
    const currentProjectCount = profile.project_count || 0;
    
    let projectLimit = 1; // Default for free
    if (userType === 'plus' || userType === 'pro') {
      projectLimit = 999999; // Unlimited
    }

    const isUnlimited = projectLimit >= 999999;
    const canCreateProject = isUnlimited || currentProjectCount < projectLimit;

    return {
      projectLimit,
      currentProjectCount,
      isUnlimited,
      canCreateProject
    };
  }

  async updateProjectCount(countChange: number): Promise<void> {
    const user = this.ensureAuthenticated();

    try {
      // First try using the RPC function
      const { error: rpcError } = await this.supabase
        .rpc('update_project_count', {
          _count_change: countChange,
          _user_id: user.id
        });

      if (rpcError) {
        console.warn('RPC function failed, falling back to direct update:', rpcError);
        
        // Fallback: Update the project count directly
        const { data: currentProfile, error: fetchError } = await this.supabase
          .from('profiles')
          .select('project_count')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        const currentCount = currentProfile?.project_count || 0;
        const newCount = Math.max(0, currentCount + countChange);

        const { error: updateError } = await this.supabase
          .from('profiles')
          .update({
            project_count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }
      }

      this.logOperation('project_count_updated', { countChange });
    } catch (error) {
      return this.handleError(error, 'updateProjectCount');
    }
  }

  async getUserBranding() {
    const user = this.ensureAuthenticated();

    try {
      const { data: branding, error } = await this.supabase
        .from('freelancer_branding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return branding;
    } catch (error) {
      return this.handleError(error, 'getUserBranding');
    }
  }
}