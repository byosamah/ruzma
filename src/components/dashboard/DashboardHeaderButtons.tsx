
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderButtonsProps {
  onNewProject: () => void;
  canCreateProject: boolean;
  onViewAnalytics: () => void;
}

const DashboardHeaderButtons: React.FC<DashboardHeaderButtonsProps> = ({
  onNewProject,
  canCreateProject,
  onViewAnalytics
}) => {
  const t = useT();
  const isMobile = useIsMobile();

  const NewProjectButton = () => {
    const button = (
      <Button 
        onClick={onNewProject} 
        disabled={!canCreateProject} 
        size={isMobile ? "default" : "default"} 
        className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} ${isMobile ? 'w-full' : ''} bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none`}
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
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <Button 
          variant="outline" 
          onClick={onViewAnalytics} 
          className="flex items-center justify-center gap-2 sm:flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <BarChart3 className="w-4 h-4" />
          {t('viewAnalytics')}
        </Button>
        <div className="sm:flex-1">
          <NewProjectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button 
        variant="outline" 
        onClick={onViewAnalytics}
        className="border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        {t('viewAnalytics')}
      </Button>
      <NewProjectButton />
    </div>
  );
};

export default DashboardHeaderButtons;
