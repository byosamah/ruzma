
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// Replaced icons with emojis
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardProjectListProps {
  projects: DatabaseProject[];
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onNewProject: () => void;
  currency: string;
  canCreateProject: boolean;
}

const DashboardProjectList: React.FC<DashboardProjectListProps> = ({
  projects,
  onEdit,
  onDelete,
  onNewProject,
  currency,
  canCreateProject,
}) => {
  const t = useT();
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_submitted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectDisplayStatus = (project: DatabaseProject) => {
    // If contract is not approved, show contract status
    if (project.contract_status && project.contract_status !== 'approved') {
      return {
        status: `Contract ${project.contract_status}`,
        color: getContractStatusColor(project.contract_status)
      };
    }
    
    // Otherwise show milestone status
    const milestoneStatus = project.milestones[0]?.status || 'pending';
    return {
      status: milestoneStatus,
      color: getStatusColor(milestoneStatus)
    };
  };

  const EmptyProjectsButton = () => {
    const button = (
      <Button 
        onClick={onNewProject} 
        size={isMobile ? "default" : "lg"}
        className={`mt-4 ${isMobile ? 'w-full min-h-[44px] touch-manipulation' : 'w-full sm:w-auto'}`}
        disabled={!canCreateProject}
      >
        <span className="text-xl mr-2">➕</span>
        {t('createFirstProject')}
      </Button>
    );

    if (!canCreateProject) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Project limit reached. Upgrade your plan to create more projects.</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <Card className="max-w-full overflow-hidden">
      <CardHeader className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <CardTitle className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <span className="text-base sm:text-lg">{t('recentProjects')}</span>
          {projects.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNewProject}
                  disabled={!canCreateProject}
                  className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} ${isMobile ? 'w-full min-h-[44px] touch-manipulation' : 'w-full sm:w-auto'}`}
                >
                  <span className="text-lg mr-2">➕</span>
                  {t('newProject')}
                </Button>
              </TooltipTrigger>
              {!canCreateProject && (
                <TooltipContent>
                  <p>Project limit reached. Upgrade your plan to create more projects.</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl text-slate-300 mx-auto mb-4 block">📄</span>
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              {t('noProjectsYet')}
            </h3>
            <p className="text-slate-400 mb-4 text-sm sm:text-base px-4">{t('createFirstProjectDesc')}</p>
            <EmptyProjectsButton />
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => {
              const totalMilestones = project.milestones.length;
              const completedMilestones = project.milestones.filter(
                (m) => m.status === 'approved'
              ).length;
              const totalValue = project.milestones.reduce(
                (sum, m) => sum + Number(m.price),
                0
              );

              return (
                <div
                  key={project.id}
                  className="border border-slate-200 rounded-lg p-3 sm:p-4 hover:bg-slate-50 transition-colors max-w-full overflow-hidden"
                >
                  <div className={`${isMobile ? 'space-y-3' : 'flex items-start justify-between'}`}>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 mb-1 text-sm sm:text-base break-words">
                        {project.name}
                      </h4>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2 break-words">
                        {project.brief}
                      </p>
                      <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'flex items-center flex-wrap gap-4'} text-sm text-slate-500`}>
                        <div className="flex items-center min-w-0">
                          <span className="text-lg mr-1 flex-shrink-0">📅</span>
                          <span className="text-xs sm:text-sm truncate">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <span className="text-lg mr-1 flex-shrink-0">📄</span>
                          <span className="text-xs sm:text-sm">
                            {completedMilestones}/{totalMilestones} {t('completed')}
                          </span>
                        </div>
                        <div className="flex items-center min-w-0">
                          <span className="text-lg mr-1 flex-shrink-0">💰</span>
                          <span className="text-xs sm:text-sm truncate">
                            {totalValue.toFixed(2)} {currency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`${isMobile ? 'flex justify-between items-center pt-3 border-t border-slate-100' : 'flex items-center space-x-2 ml-4 flex-shrink-0'}`}>
                      {(() => {
                        const displayStatus = getProjectDisplayStatus(project);
                        return (
                          <Badge
                            className={`${displayStatus.color} text-xs flex-shrink-0`}
                          >
                            {displayStatus.status}
                          </Badge>
                        );
                      })()}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(project.id)}
                          className={`${isMobile ? 'min-h-[44px] min-w-[44px] touch-manipulation' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-lg">✏️</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(project.id)}
                          className={`text-red-500 hover:text-red-700 ${isMobile ? 'min-h-[44px] min-w-[44px] touch-manipulation' : 'h-8 w-8'} p-0`}
                        >
                          <span className="text-lg">🗑️</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(DashboardProjectList);
