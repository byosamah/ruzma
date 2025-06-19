
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FolderOpen, TrendingUp, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useT } from '@/lib/i18n';

interface UsageIndicatorsProps {
  userProfile: any;
  projects: DatabaseProject[];
}

export const UsageIndicators: React.FC<UsageIndicatorsProps> = ({
  userProfile,
  projects,
}) => {
  const navigate = useNavigate();
  const t = useT();
  const usage = useUsageTracking(userProfile, projects);

  const handleUpgradeClick = () => {
    const userType = userProfile?.user_type || 'free';
    if (userType === 'pro') {
      navigate('/contact');
    } else {
      navigate('/plans');
    }
  };

  const getUpgradeButtonText = () => {
    const userType = userProfile?.user_type || 'free';
    return userType === 'pro' ? t('contactUs') : t('upgrade');
  };

  const getUpgradeButtonIcon = () => {
    const userType = userProfile?.user_type || 'free';
    return userType === 'pro' ? MessageCircle : TrendingUp;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {/* Projects Usage */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-slate-600">{t('projectsUsed')}</CardTitle>
          <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">
                {usage.projects.current} of {usage.projects.max}
              </span>
              {usage.projects.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs h-6 px-2"
                >
                  {React.createElement(getUpgradeButtonIcon(), { className: "h-2.5 w-2.5 mr-1" })}
                  {getUpgradeButtonText()}
                </Button>
              )}
            </div>
            <Progress
              value={usage.projects.percentage}
              className="h-1.5"
            />
            <p className="text-xs text-slate-500">
              {usage.projects.percentage}% {t('used')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-slate-600">{t('storageUsed')}</CardTitle>
          <Database className="h-3.5 w-3.5 text-slate-400" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">
                {usage.storage.currentFormatted} of {usage.storage.maxFormatted}
              </span>
              {usage.storage.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs h-6 px-2"
                >
                  {React.createElement(getUpgradeButtonIcon(), { className: "h-2.5 w-2.5 mr-1" })}
                  {getUpgradeButtonText()}
                </Button>
              )}
            </div>
            <Progress
              value={usage.storage.percentage}
              className="h-1.5"
            />
            <p className="text-xs text-slate-500">
              {usage.storage.percentage}% {t('used')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
