import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/core/useAuth';
import { validateSubscriptionAccess } from '@/lib/subscriptionValidator';
import { PLAN_CONFIG } from '@/hooks/subscription/constants';
import { supabase } from '@/integrations/supabase/client';

export interface GracePeriodWarning {
  isInGracePeriod: boolean;
  gracePeriodType: 'trial' | 'payment' | null;
  daysRemaining: number;
  willDowngradeTo: 'free' | 'plus' | null;
  currentProjectCount: number;
  allowedProjects: number;
  projectsAtRisk: number;
  projectsAtRiskList: Array<{
    id: string;
    name: string;
    slug: string;
    total_amount?: number;
    currency?: string;
  }>;
}

/**
 * Hook to detect grace periods and warn about pending project archival
 */
export function useGracePeriodWarnings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gracePeriodWarnings', user?.id],
    queryFn: async (): Promise<GracePeriodWarning> => {
      if (!user?.id) {
        return {
          isInGracePeriod: false,
          gracePeriodType: null,
          daysRemaining: 0,
          willDowngradeTo: null,
          currentProjectCount: 0,
          allowedProjects: 0,
          projectsAtRisk: 0,
          projectsAtRiskList: []
        };
      }

      // Check subscription status and grace period
      const subscriptionValidation = await validateSubscriptionAccess(user.id);
      
      if (!subscriptionValidation.isGracePeriod || !subscriptionValidation.gracePeriodType) {
        return {
          isInGracePeriod: false,
          gracePeriodType: null,
          daysRemaining: 0,
          willDowngradeTo: null,
          currentProjectCount: 0,
          allowedProjects: 0,
          projectsAtRisk: 0,
          projectsAtRiskList: []
        };
      }

      // Determine what plan user will downgrade to
      const willDowngradeTo: 'free' | 'plus' | null = 
        subscriptionValidation.gracePeriodType === 'trial' ? 'free' :
        subscriptionValidation.gracePeriodType === 'payment' && subscriptionValidation.userType === 'pro' ? 'plus' :
        'free';

      // Get user's current projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, slug, total_amount, currency, updated_at')
        .eq('user_id', user.id)
        .neq('status', 'archived')
        .order('updated_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects for grace period warning:', projectsError);
        return {
          isInGracePeriod: true,
          gracePeriodType: subscriptionValidation.gracePeriodType,
          daysRemaining: subscriptionValidation.daysUntilExpiry || 0,
          willDowngradeTo,
          currentProjectCount: 0,
          allowedProjects: 0,
          projectsAtRisk: 0,
          projectsAtRiskList: []
        };
      }

      const currentProjectCount = projects?.length || 0;
      const allowedProjects = PLAN_CONFIG[willDowngradeTo].max_projects;
      const projectsAtRisk = Math.max(0, currentProjectCount - allowedProjects);

      // Projects at risk are the oldest ones (will be archived first)
      const projectsAtRiskList = projectsAtRisk > 0 ? 
        projects!.slice(allowedProjects) : [];

      return {
        isInGracePeriod: true,
        gracePeriodType: subscriptionValidation.gracePeriodType,
        daysRemaining: subscriptionValidation.daysUntilExpiry || 0,
        willDowngradeTo,
        currentProjectCount,
        allowedProjects,
        projectsAtRisk,
        projectsAtRiskList
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get grace period message for UI display
 */
export function useGracePeriodMessage() {
  const { data: warning, isLoading } = useGracePeriodWarnings();

  if (isLoading || !warning?.isInGracePeriod) {
    return null;
  }

  const { gracePeriodType, daysRemaining, projectsAtRisk, willDowngradeTo } = warning;

  // Base message about grace period
  let message = '';
  if (gracePeriodType === 'trial') {
    message = `Your free trial has expired. You have ${daysRemaining} days left to complete payment.`;
  } else if (gracePeriodType === 'payment') {
    message = `Payment failed. You have ${daysRemaining} days left to update your payment method.`;
  }

  // Add project warning if applicable
  if (projectsAtRisk > 0) {
    const projectWord = projectsAtRisk === 1 ? 'project' : 'projects';
    const planName = willDowngradeTo === 'free' ? 'Free' : 'Plus';
    
    message += ` If not resolved, ${projectsAtRisk} ${projectWord} will be archived when downgraded to ${planName} plan.`;
  }

  return {
    message,
    type: daysRemaining <= 1 ? 'critical' : 'warning',
    projectsAtRisk,
    daysRemaining
  };
}