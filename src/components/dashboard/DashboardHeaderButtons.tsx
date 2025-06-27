
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

  return (
    <div className="flex justify-end">
      <NewProjectButton />
    </div>
  );
};

export default DashboardHeaderButtons;
