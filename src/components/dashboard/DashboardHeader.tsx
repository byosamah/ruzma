
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
        className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} ${isMobile ? 'w-full' : 'px-6'} h-11 font-medium`}
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
        <div className="text-center px-4">
          <h1 className="text-3xl font-semibold text-foreground leading-tight mb-3">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-base">{t('dashboardSubtitle')}</p>
        </div>
        <div className="flex flex-col space-y-3 px-2 sm:px-0 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button 
            variant="outline" 
            onClick={onViewAnalytics}
            className="flex items-center justify-center gap-2 sm:flex-1 h-11 font-medium"
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
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-10 space-y-6 lg:space-y-0">
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight mb-3">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground text-lg">{t('dashboardSubtitle')}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
        <Button 
          variant="outline" 
          onClick={onViewAnalytics}
          className="flex items-center gap-2 px-6 h-11 font-medium"
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
