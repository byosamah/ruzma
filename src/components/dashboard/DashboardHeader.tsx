
import React from 'react';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardHeaderButtons from './DashboardHeaderButtons';

interface DashboardHeaderProps {
  displayName: string;
  onNewProject: () => void;
  canCreateProject: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  displayName,
  onNewProject,
  canCreateProject
}) => {
  const t = useT();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium text-gray-900">
            {t('welcomeComma')} {displayName}
          </h1>
          <p className="text-sm text-gray-500">{t('dashboardSubtitle')}</p>
        </div>
        <DashboardHeaderButtons
          onNewProject={onNewProject}
          canCreateProject={canCreateProject}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between items-start mb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-gray-900">
          {t('welcomeComma')} {displayName}
        </h1>
        <p className="text-sm text-gray-500">{t('dashboardSubtitle')}</p>
      </div>
      <DashboardHeaderButtons
        onNewProject={onNewProject}
        canCreateProject={canCreateProject}
      />
    </div>
  );
};

export default DashboardHeader;
