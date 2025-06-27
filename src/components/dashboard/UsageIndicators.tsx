
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FolderOpen, TrendingUp, MessageCircle, Link } from 'lucide-react';
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

  const getUpgradeButtonIcon = () => {
    return userType === 'pro' ? MessageCircle : TrendingUp;
  };

  if (usage.loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="saas-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span className="ml-2 text-sm text-gray-500">Loading usage...</span>
            </div>
          </CardContent>
        </Card>
        <Card className="saas-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span className="ml-2 text-sm text-gray-500">Loading usage...</span>
            </div>
          </CardContent>
        </Card>
      </div>;
  }

  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Projects Usage */}
      <Card className="saas-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">{t('projectsUsed')}</CardTitle>
          <FolderOpen className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-gray-900">
                {usage.projects.current} of {usage.projects.max}
              </span>
              {usage.projects.percentage >= 100 && <Button size="sm" onClick={handleUpgradeClick} className="text-xs px-3 py-1 font-medium bg-gray-900 hover:bg-gray-800 text-slate-50">
                  {React.createElement(getUpgradeButtonIcon(), {
                className: "h-3 w-3 mr-1"
              })}
                  {getUpgradeButtonText()}
                </Button>}
            </div>
            <Progress value={usage.projects.percentage} className="h-2" />
            <p className="text-xs text-gray-500">
              {usage.projects.percentage}% {t('used')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage / Links Only */}
      <Card className="saas-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            {userType === 'free' ? 'Links Only' : t('storageUsed')}
          </CardTitle>
          {userType === 'free' ? <Link className="h-4 w-4 text-gray-400" /> : <Database className="h-4 w-4 text-gray-400" />}
        </CardHeader>
        <CardContent className="pb-4">
          {userType === 'free' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-600">
                  Share project links with clients
                </span>
                <Button size="sm" onClick={handleUpgradeClick} className="text-xs px-3 py-1 font-medium bg-gray-900 hover:bg-gray-800 text-slate-50">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {t('upgrade')}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Upgrade to upload files and manage storage
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-gray-900">
                  {usage.storage.currentFormatted} of {usage.storage.maxFormatted}
                </span>
                {usage.storage.percentage >= 100 && <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1 font-medium" onClick={handleUpgradeClick}>
                    {React.createElement(getUpgradeButtonIcon(), {
                  className: "h-3 w-3 mr-1"
                })}
                    {getUpgradeButtonText()}
                  </Button>}
              </div>
              <Progress value={usage.storage.percentage} className="h-2" />
              <p className="text-xs text-gray-500">
                {usage.storage.percentage}% {t('used')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>;
};
