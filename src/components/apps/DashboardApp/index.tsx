/**
 * Dashboard App Component
 *
 * macOS window version of the Dashboard page.
 * Displays:
 * - Welcome header
 * - Usage indicators
 * - Statistics cards
 * - Recent projects list
 *
 * This is the content that appears inside the Dashboard window.
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ProjectCard from '@/components/ProjectCard';
import { UsageIndicators } from '@/components/dashboard/UsageIndicators';
import { GracePeriodWarning } from '@/components/Subscription/GracePeriodWarning';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardAppProps {
  /** Window ID (passed by WindowRenderer) */
  windowId?: string;
  /** Optional data passed when opening window */
  data?: Record<string, unknown>;
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

interface EmptyProjectsProps {
  canCreateProject: boolean;
  userType: string;
  onNewProject: () => void;
}

function EmptyProjects({ canCreateProject, userType, onNewProject }: EmptyProjectsProps) {
  const t = useT();

  const buttonText = !canCreateProject && userType === 'pro'
    ? t('contactUsForMoreProjects')
    : t('createFirstProject');
  const buttonEmoji = !canCreateProject && userType === 'pro' ? '💬' : '✨';
  const tooltipMessage = !canCreateProject
    ? userType === 'pro'
      ? t('projectLimitReachedPro')
      : t('projectLimitReached')
    : '';

  const button = (
    <Button
      onClick={onNewProject}
      size="lg"
      className="w-full px-4 py-3 text-sm bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none"
    >
      <span className="text-lg mr-2">{buttonEmoji}</span>
      <span className="text-sm">{buttonText}</span>
    </Button>
  );

  if (tooltipMessage) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DashboardApp({ windowId, data }: DashboardAppProps) {
  const { dir } = useLanguage();
  const { openApp } = useWindowManager();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Get dashboard data using existing hook
  const {
    user,
    profile,
    loading,
    projects,
    userCurrency,
    stats,
    displayName,
    handleDeleteProject,
  } = useDashboard();

  // Track usage limits
  const usage = useUsageTracking(profile, projects);

  /**
   * Handle creating new project
   * Opens the Finder app with create-project mode
   */
  const handleNewProject = useCallback(() => {
    if (usage.canCreateProject) {
      // Open Finder app with create mode
      openApp('finder', { mode: 'create-project' });
    } else {
      const userType = profile?.user_type || 'free';
      if (userType === 'pro') {
        // Open help/contact app
        openApp('help');
      }
    }
  }, [usage.canCreateProject, profile?.user_type, openApp]);

  /**
   * Handle viewing a project
   * Opens a new project window
   */
  const handleViewProject = useCallback((projectSlug: string) => {
    openApp('project', { slug: projectSlug });
  }, [openApp]);

  /**
   * Handle editing a project
   */
  const handleEditProject = useCallback((projectSlug: string) => {
    openApp('finder', { mode: 'edit-project', slug: projectSlug });
  }, [openApp]);

  // Show loading state
  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div
      className={cn(
        'dashboard-app h-full overflow-y-auto',
        'bg-white/50',
        isRTL && 'text-right'
      )}
      style={{ direction: dir }}
    >
      <div className="p-4 space-y-4">
        {/* Dashboard Header */}
        <DashboardHeader
          displayName={displayName}
          onNewProject={handleNewProject}
          canCreateProject={usage.canCreateProject}
        />

        {/* Grace Period Warning */}
        <GracePeriodWarning variant="card" className="w-full" />

        {/* Usage Indicators */}
        <UsageIndicators userProfile={profile} projects={projects} />

        {/* Dashboard Statistics */}
        <DashboardStats
          totalProjects={stats.totalProjects}
          totalEarnings={stats.totalEarnings}
          completedMilestones={stats.completedMilestones}
          totalMilestones={stats.totalMilestones}
          pendingPayments={stats.pendingPayments}
          userCurrency={userCurrency.currency}
        />

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('yourProjects')}</h2>
          </div>

          {!projects.length ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <div className="mx-auto max-w-md space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-3xl">
                  📄
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">{t('noProjectsYet')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('createFirstProjectDesc')}
                  </p>
                </div>
                <EmptyProjects
                  canCreateProject={usage.canCreateProject}
                  userType={profile?.user_type || 'free'}
                  onNewProject={handleNewProject}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewClick={() => handleViewProject(project.slug)}
                  onEditClick={() => handleEditProject(project.slug)}
                  onDeleteClick={handleDeleteProject}
                  currency={userCurrency.currency}
                  convertFrom={project.currency || project.freelancer_currency}
                  isVerticalLayout={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardApp;
