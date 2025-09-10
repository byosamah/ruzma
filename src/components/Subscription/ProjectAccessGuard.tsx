import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Lock, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/core/useAuth';
import { validateSubscriptionAccess } from '@/lib/subscriptionValidator';
import { PLAN_CONFIG } from '@/hooks/subscription/constants';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useT } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectAccessGuardProps {
  projectId: string;
  children: React.ReactNode;
  fallbackRedirect?: string;
}

interface ProjectAccessStatus {
  hasAccess: boolean;
  reason?: 'archived' | 'plan_limits' | 'subscription_expired';
  userPlan: string;
  projectInfo?: {
    name: string;
    status: string;
    archived_at?: string;
    archive_reason?: string;
  };
}

/**
 * Guards project access based on subscription status and plan limits
 */
export function ProjectAccessGuard({ 
  projectId, 
  children, 
  fallbackRedirect = '/dashboard' 
}: ProjectAccessGuardProps) {
  const { user } = useAuth();
  const { navigate } = useLanguageNavigation();
  const t = useT();

  const { data: accessStatus, isLoading, error } = useQuery({
    queryKey: ['projectAccess', projectId, user?.id],
    queryFn: async (): Promise<ProjectAccessStatus> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get project info
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, name, status, archived_at, archive_reason, user_id, updated_at')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found or access denied');
      }

      // If project is archived, check if it's due to plan limits
      if (project.status === 'archived') {
        return {
          hasAccess: false,
          reason: 'archived',
          userPlan: 'unknown',
          projectInfo: {
            name: project.name,
            status: project.status,
            archived_at: project.archived_at,
            archive_reason: project.archive_reason
          }
        };
      }

      // Validate subscription and check plan limits
      const subscriptionValidation = await validateSubscriptionAccess(user.id);
      const effectiveUserType = subscriptionValidation.isValid ? 
        subscriptionValidation.userType : 'free';

      // Get user's active projects count and order
      const { data: userProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, updated_at')
        .eq('user_id', user.id)
        .neq('status', 'archived')
        .order('updated_at', { ascending: false });

      if (projectsError) {
        console.error('Error checking user projects:', projectsError);
        // Allow access if we can't check limits
        return {
          hasAccess: true,
          userPlan: effectiveUserType
        };
      }

      const planConfig = PLAN_CONFIG[effectiveUserType as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;
      const projectLimit = planConfig.max_projects;

      // If unlimited projects or within limits, allow access
      if (projectLimit === -1 || (userProjects?.length || 0) <= projectLimit) {
        return {
          hasAccess: true,
          userPlan: effectiveUserType
        };
      }

      // Check if this specific project is within the allowed limit
      const projectIndex = userProjects?.findIndex(p => p.id === projectId) ?? -1;
      const isWithinLimit = projectIndex >= 0 && projectIndex < projectLimit;

      return {
        hasAccess: isWithinLimit,
        reason: isWithinLimit ? undefined : 'plan_limits',
        userPlan: effectiveUserType,
        projectInfo: {
          name: project.name,
          status: project.status
        }
      };
    },
    enabled: !!user?.id && !!projectId,
    staleTime: 30 * 1000, // 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <Navigate to={fallbackRedirect} replace />;
  }

  if (!accessStatus || accessStatus.hasAccess) {
    return <>{children}</>;
  }

  // Render access denied UI based on reason
  if (accessStatus.reason === 'archived') {
    return <ArchivedProjectView accessStatus={accessStatus} />;
  }

  if (accessStatus.reason === 'plan_limits') {
    return <PlanLimitView accessStatus={accessStatus} />;
  }

  // Default fallback
  return <Navigate to={fallbackRedirect} replace />;
}

function ArchivedProjectView({ accessStatus }: { accessStatus: ProjectAccessStatus }) {
  const { navigate } = useLanguageNavigation();
  const t = useT();

  const getArchiveReason = () => {
    const reason = accessStatus.projectInfo?.archive_reason;
    if (reason?.includes('plan_downgrade')) {
      return 'This project was archived when your subscription was downgraded.';
    }
    return 'This project has been archived.';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Archive className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Project Archived</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <p className="text-gray-600 mb-2">
              <strong>{accessStatus.projectInfo?.name}</strong>
            </p>
            <p className="text-sm text-gray-500">{getArchiveReason()}</p>
            {accessStatus.projectInfo?.archived_at && (
              <p className="text-xs text-gray-400 mt-2">
                Archived on {new Date(accessStatus.projectInfo.archived_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <Alert className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              To restore this project, upgrade your plan or make space by archiving other projects.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button 
              onClick={() => navigate('/plans')} 
              className="flex-1"
            >
              Upgrade Plan
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/projects')}
              className="flex-1"
            >
              View Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlanLimitView({ accessStatus }: { accessStatus: ProjectAccessStatus }) {
  const { navigate } = useLanguageNavigation();
  const t = useT();

  const planName = accessStatus.userPlan === 'free' ? 'Free' : 
                   accessStatus.userPlan === 'plus' ? 'Plus' : 'Pro';
  
  const planLimit = PLAN_CONFIG[accessStatus.userPlan as keyof typeof PLAN_CONFIG]?.max_projects || 1;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Project Access Limited</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <p className="text-gray-600 mb-2">
              <strong>{accessStatus.projectInfo?.name}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Your {planName} plan allows access to {planLimit} project{planLimit !== 1 ? 's' : ''}. 
              This project is beyond your current limit.
            </p>
          </div>

          <Alert className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You can still access this project's data by upgrading your plan or 
              by archiving other projects to make room.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button 
              onClick={() => navigate('/plans')} 
              className="flex-1"
            >
              Upgrade Plan
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/projects')}
              className="flex-1"
            >
              Manage Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}