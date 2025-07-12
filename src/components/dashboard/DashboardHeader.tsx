
import React from 'react';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardHeaderButtons from './DashboardHeaderButtons';
import YouTubePopup from '@/components/YouTubePopup';

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
      <div className="space-y-4 mb-6 max-w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-medium text-gray-900 break-words">
              {t('welcomeComma')} {displayName}
            </h1>
            <YouTubePopup 
              videoId="I4amluTB1BE"
              buttonText={t('knowMore')}
              buttonVariant="ghost"
              buttonSize="sm"
            />
          </div>
          <p className="text-sm text-gray-500 break-words">{t('dashboardSubtitle')}</p>
        </div>
        <div className="w-full">
          <DashboardHeaderButtons
            onNewProject={onNewProject}
            canCreateProject={canCreateProject}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4 max-w-full">
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-medium text-gray-900 break-words">
            {t('welcomeComma')} {displayName}
          </h1>
          <YouTubePopup 
            videoId="I4amluTB1BE"
            buttonText={t('knowMore')}
            buttonVariant="ghost"
            buttonSize="sm"
          />
        </div>
        <p className="text-sm text-gray-500 break-words">{t('dashboardSubtitle')}</p>
      </div>
      <div className="flex-shrink-0">
        <DashboardHeaderButtons
          onNewProject={onNewProject}
          canCreateProject={canCreateProject}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
