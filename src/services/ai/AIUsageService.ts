import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AIUsageRecord {
  id?: string;
  user_id: string;
  feature_type: 'business_insights' | 'project_recommendations' | 'revenue_optimization' | 'project_types';
  usage_date: string;
  usage_count: number;
  created_at?: string;
  updated_at?: string;
}

interface UserPlan {
  user_type: 'free' | 'pro' | 'enterprise';
  ai_features_enabled: boolean;
  daily_ai_calls_limit: number;
}

export class AIUsageService {
  private user: User | null;

  constructor(user: User | null) {
    this.user = user;
  }

  // Get user's plan details
  async getUserPlan(): Promise<UserPlan> {
    if (!this.user) {
      return {
        user_type: 'free',
        ai_features_enabled: false,
        daily_ai_calls_limit: 0
      };
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', this.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return {
          user_type: 'free',
          ai_features_enabled: false,
          daily_ai_calls_limit: 0
        };
      }

      const userType = profile?.user_type || 'free';
      
      // Define plan limits - default to pro for now during development
      const planLimits = {
        free: { ai_features_enabled: false, daily_ai_calls_limit: 0 },
        pro: { ai_features_enabled: true, daily_ai_calls_limit: 1 },
        enterprise: { ai_features_enabled: true, daily_ai_calls_limit: 5 }
      };

      // Default to pro for development - in production this should check actual subscription
      const actualUserType = userType || 'pro';
      const limits = planLimits[actualUserType as keyof typeof planLimits] || planLimits.pro;

      return {
        user_type: actualUserType as 'free' | 'pro' | 'enterprise',
        ai_features_enabled: limits.ai_features_enabled,
        daily_ai_calls_limit: limits.daily_ai_calls_limit
      };
    } catch (error) {
      console.error('Error getting user plan:', error);
      // Default to pro for development when there's an error
      return {
        user_type: 'pro',
        ai_features_enabled: true,
        daily_ai_calls_limit: 1
      };
    }
  }

  // Check if user can make AI calls today
  async canMakeAICall(featureType: AIUsageRecord['feature_type']): Promise<{
    canCall: boolean;
    reason?: string;
    upgradeRequired?: boolean;
    usageCount?: number;
    limit?: number;
  }> {
    const plan = await this.getUserPlan();

    // Free users cannot make AI calls
    if (!plan.ai_features_enabled) {
      return {
        canCall: false,
        reason: 'AI features are available for Pro and Enterprise users only',
        upgradeRequired: true
      };
    }

    if (!this.user) {
      return {
        canCall: false,
        reason: 'Authentication required',
        upgradeRequired: false
      };
    }

    // For now, skip database checks and allow AI calls for paid users
    // TODO: Implement proper database tracking when ai_usage table is available
    return {
      canCall: true,
      usageCount: 0,
      limit: plan.daily_ai_calls_limit
    };
  }

  // Record AI usage
  async recordAIUsage(featureType: AIUsageRecord['feature_type']): Promise<void> {
    if (!this.user) {
      return; // Skip silently if no user
    }

    // For now, just log usage instead of storing in database
    // TODO: Implement proper database storage when ai_usage table is available
    console.log(`AI usage would be recorded: ${featureType} for user ${this.user.id}`);
  }

  // Get user's usage statistics
  async getUsageStats(): Promise<{
    today: Record<string, number>;
    thisWeek: Record<string, number>;
    thisMonth: Record<string, number>;
  }> {
    // Return empty stats for now since database table doesn't exist
    // TODO: Implement proper stats when ai_usage table is available
    return { today: {}, thisWeek: {}, thisMonth: {} };
  }
}

export const createAIUsageService = (user: User | null) => new AIUsageService(user);