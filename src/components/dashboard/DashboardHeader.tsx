
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const NewProjectButton = () => {
    const button = (
      <Button 
        onClick={onNewProject} 
        disabled={!canCreateProject}
        className={!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('newProject')}
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
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          {t('welcomeBack')}, {displayName}!
        </h1>
        <p className="text-slate-600 mt-1">{t('dashboardSubtitle')}</p>
      </div>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewAnalytics}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          View Analytics
        </Button>
        <NewProjectButton />
      </div>
    </div>
  );
};

export default DashboardHeader;
