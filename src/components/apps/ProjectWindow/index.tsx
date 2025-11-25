/**
 * Project Window Component
 *
 * Individual project window that opens when clicking a desktop folder.
 * Shows project details, milestones, and actions.
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectWindowProps {
  /** Window ID (passed by WindowRenderer) */
  windowId?: string;
  /** Data passed when opening window */
  data?: {
    slug?: string;
    [key: string]: unknown;
  };
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function ProjectLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

// =============================================================================
// NOT FOUND COMPONENT
// =============================================================================

function ProjectNotFound() {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
      <div className="text-5xl mb-4">📁</div>
      <h3 className="text-lg font-medium text-gray-700">
        {t('projectNotFound') || 'Project Not Found'}
      </h3>
      <p className="text-sm text-gray-500 mt-2">
        {t('projectNotFoundDesc') || 'The project you are looking for does not exist.'}
      </p>
    </div>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const t = useT();
  
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: t('active') || 'Active', variant: 'default' },
    completed: { label: t('completed') || 'Completed', variant: 'secondary' },
    archived: { label: t('archived') || 'Archived', variant: 'outline' },
    draft: { label: t('draft') || 'Draft', variant: 'outline' },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ProjectWindow({ windowId, data }: ProjectWindowProps) {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Get project slug from window data
  const projectSlug = data?.slug as string | undefined;

  // Get projects from dashboard hook
  const { projects, loading, userCurrency } = useDashboard();

  // Find the specific project
  const project = useMemo(() => {
    if (!projectSlug || !projects) return null;
    return projects.find((p) => p.slug === projectSlug);
  }, [projectSlug, projects]);

  // Calculate milestone progress
  const milestoneProgress = useMemo(() => {
    if (!project?.milestones?.length) return 0;
    const completed = project.milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completed / project.milestones.length) * 100);
  }, [project]);

  // Show loading state
  if (loading) {
    return <ProjectLoading />;
  }

  // Show not found if no project
  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div
      className={cn(
        'project-window h-full overflow-y-auto',
        'bg-white',
        isRTL && 'text-right'
      )}
      style={{ direction: dir }}
    >
      <div className="p-4 space-y-4">
        {/* Project Header */}
        <div className={cn(
          'flex items-start justify-between gap-4',
          isRTL && 'flex-row-reverse'
        )}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.client && (
              <p className="text-gray-500 mt-1">
                {t('client') || 'Client'}: {project.client.name}
              </p>
            )}
          </div>
          <StatusBadge status={project.status || 'draft'} />
        </div>

        {/* Project Brief */}
        {project.brief && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">
                {t('projectBrief') || 'Project Brief'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {project.brief}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              {t('progress') || 'Progress'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={cn(
                'flex justify-between text-sm',
                isRTL && 'flex-row-reverse'
              )}>
                <span>{t('milestones') || 'Milestones'}</span>
                <span>{milestoneProgress}%</span>
              </div>
              <Progress value={milestoneProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">
                {t('milestones') || 'Milestones'} ({project.milestones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg bg-gray-50',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full shrink-0',
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {userCurrency.symbol}{milestone.price?.toLocaleString() || '0'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className={cn(
          'flex gap-2 pt-2',
          isRTL && 'flex-row-reverse'
        )}>
          <Button variant="outline" className="flex-1">
            {t('editProject') || 'Edit Project'}
          </Button>
          <Button className="flex-1">
            {t('viewDetails') || 'View Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectWindow;
