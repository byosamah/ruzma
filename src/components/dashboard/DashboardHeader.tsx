
import React from 'react';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardHeaderButtons from './DashboardHeaderButtons';

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
  onViewAnalytics
}) => {
  const t = useT();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-6 mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('welcomeComma')} {displayName}!
          </h1>
          <p className="text-saas-gray-600">{t('dashboardSubtitle')}</p>
        </div>
        <DashboardHeaderButtons
          onNewProject={onNewProject}
          canCreateProject={canCreateProject}
          onViewAnalytics={onViewAnalytics}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 space-y-4 lg:space-y-0">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {t('welcomeComma')} {displayName}!
        </h1>
        <p className="text-saas-gray-600">{t('dashboardSubtitle')}</p>
      </div>
      <DashboardHeaderButtons
        onNewProject={onNewProject}
        canCreateProject={canCreateProject}
        onViewAnalytics={onViewAnalytics}
      />
    </div>
  );
};

export default DashboardHeader;
