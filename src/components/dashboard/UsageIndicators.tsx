import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Replaced icons with emojis
import { useNavigate } from 'react-router-dom';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useT } from '@/lib/i18n';
import { UpcomingDeadlines } from './UpcomingDeadlines';
interface UsageIndicatorsProps {
  userProfile: any;
  projects: DatabaseProject[];
}
export const UsageIndicators: React.FC<UsageIndicatorsProps> = ({
  userProfile,
  projects
}) => {
  const navigate = useNavigate();
  const t = useT();
  const usage = useUsageTracking(userProfile, projects);
  const userType = userProfile?.user_type || 'free';
  const handleUpgradeClick = () => {
    if (userType === 'pro') {
      navigate('/contact');
    } else {
      navigate('/plans');
    }
  };
  const getUpgradeButtonText = () => {
    return userType === 'pro' ? t('contactUs') : t('upgrade');
  };
  const getUpgradeButtonEmoji = () => {
    return userType === 'pro' ? '💬' : '📈';
  };
  if (usage.loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-0 shadow-none bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span className="ml-2 text-sm text-gray-500">{t('loading')}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-none bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span className="ml-2 text-sm text-gray-500">{t('loading')}</span>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {/* Projects Usage */}
      <Card className="border-0 shadow-none bg-gray-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">{t('projectsUsed')}</CardTitle>
          <span className="text-xl sm:text-2xl text-gray-400">
            {usage.projects.isUnlimited ? '♾️' : '📂'}
          </span>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl sm:text-3xl font-semibold text-gray-900">
                {usage.projects.isUnlimited ? <div className="flex items-center gap-2">
                    {usage.projects.current}
                    
                  </div> : `${usage.projects.current} ${t('of')} ${usage.projects.max}`}
              </span>
              {!usage.projects.isUnlimited && usage.projects.percentage >= 100 && <Button size="sm" onClick={handleUpgradeClick} className="text-xs px-3 py-1 font-medium bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none">
                  <span className="text-sm sm:text-lg mr-1">{getUpgradeButtonEmoji()}</span>
                  <span className="hidden sm:inline">{getUpgradeButtonText()}</span>
                </Button>}
            </div>
            {!usage.projects.isUnlimited && <>
                <Progress value={usage.projects.percentage} className="h-2 bg-gray-200" />
                <p className="text-xs text-gray-500">
                  {usage.projects.percentage}% {t('used')}
                </p>
              </>}
            {usage.projects.isUnlimited && <p className="text-xs text-gray-500">
                {t('unlimitedProjects')}
              </p>}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <UpcomingDeadlines projects={projects} />
    </div>;
};