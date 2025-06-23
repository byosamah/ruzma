
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderProps {
  displayName: string;
  onNewProject: () => void;
  canCreateProject: boolean;
  onViewAnalytics: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  displayName,
  onNewProject,
  canCreateProject,
  onViewAnalytics,
}) => {
  const t = useT();
  const isMobile = useIsMobile();

  const NewProjectButton = () => {
    const button = (
      <Button 
        onClick={onNewProject} 
        disabled={!canCreateProject}
        size={isMobile ? "default" : "default"}
        className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} ${isMobile ? 'w-full' : ''} bg-black hover:bg-gray-800 text-white font-medium`}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('newProject')}
      </Button>
    );

    if (!canCreateProject && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('projectLimitReached')}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  if (isMobile) {
    return (
      <div className="space-y-6 mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome, {displayName}!
          </h1>
          <p className="text-saas-gray-600">{t('dashboardSubtitle')}</p>
        </div>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button 
            variant="outline" 
            onClick={onViewAnalytics}
            className="flex items-center justify-center gap-2 sm:flex-1 saas-button-secondary"
          >
            <BarChart3 className="w-4 h-4" />
            {t('viewAnalytics')}
          </Button>
          <div className="sm:flex-1">
            <NewProjectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 space-y-4 lg:space-y-0">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Welcome, {displayName}!
        </h1>
        <p className="text-saas-gray-600">{t('dashboardSubtitle')}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onClick={onViewAnalytics}
          className="flex items-center gap-2 saas-button-secondary"
        >
          <BarChart3 className="w-4 h-4" />
          {t('viewAnalytics')}
        </Button>
        <NewProjectButton />
      </div>
    </div>
  );
};

export default DashboardHeader;
