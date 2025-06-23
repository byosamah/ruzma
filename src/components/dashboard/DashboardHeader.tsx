
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
        className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} ${isMobile ? 'w-full' : 'px-6'} h-10 sm:h-11`}
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
      <div className="space-y-4 mb-6">
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight mb-2">
            Welcome, {displayName}!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">{t('dashboardSubtitle')}</p>
        </div>
        <div className="flex flex-col space-y-3 px-2 sm:px-0 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button 
            variant="outline" 
            onClick={onViewAnalytics}
            className="flex items-center justify-center gap-2 sm:flex-1 h-10 sm:h-11"
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
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Welcome, {displayName}!
        </h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">{t('dashboardSubtitle')}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
        <Button 
          variant="outline" 
          onClick={onViewAnalytics}
          className="flex items-center gap-2 px-4 sm:px-6 h-10 sm:h-11"
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
