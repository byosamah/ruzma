
import React from 'react';
import { Button } from '@/components/ui/button';
// Replaced icons with emojis
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardHeaderButtonsProps {
  onNewProject: () => void;
  canCreateProject: boolean;
}

const DashboardHeaderButtons: React.FC<DashboardHeaderButtonsProps> = ({
  onNewProject,
  canCreateProject
}) => {
  const t = useT();
  const isMobile = useIsMobile();

  const NewProjectButton = () => {
    const button = (
      <Button 
        onClick={onNewProject} 
        disabled={!canCreateProject} 
        size="lg"
        className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} w-full min-h-[56px] px-6 sm:px-8 py-4 text-base sm:text-lg font-medium touch-manipulation animate-hover-scale`}
      >
        <span className="text-lg sm:text-xl mr-2">✨</span>
        <span className="text-base sm:text-lg">{t('newProject')}</span>
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

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-md">
        <NewProjectButton />
      </div>
    </div>
  );
};

export default DashboardHeaderButtons;
