
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
        size={isMobile ? "default" : "default"} 
        className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} ${isMobile ? 'w-full' : ''}`}
      >
        <span className="text-base mr-2">➕</span>
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

  return (
    <div className="flex justify-end">
      <NewProjectButton />
    </div>
  );
};

export default DashboardHeaderButtons;
