
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FolderOpen, TrendingUp, MessageCircle, Loader2 } from 'lucide-react';
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

  if (usage.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-border">
          <CardContent className="px-6 py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-3 text-sm text-muted-foreground">Loading usage...</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="px-6 py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-3 text-sm text-muted-foreground">Loading usage...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Projects Usage */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('projectsUsed')}
          </CardTitle>
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-foreground">
                {usage.projects.current} <span className="text-lg text-muted-foreground">of {usage.projects.max}</span>
              </span>
              {usage.projects.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs h-8 px-3 font-medium"
                >
                  {React.createElement(getUpgradeButtonIcon(), { className: "h-3 w-3 mr-1" })}
                  {getUpgradeButtonText()}
                </Button>
              )}
            </div>
            <Progress
              value={usage.projects.percentage}
              className="h-2"
            />
            <p className="text-sm text-muted-foreground">
              {usage.projects.percentage}% {t('used')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('storageUsed')}
          </CardTitle>
          <Database className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-foreground">
                {usage.storage.currentFormatted} <span className="text-lg text-muted-foreground">of {usage.storage.maxFormatted}</span>
              </span>
              {usage.storage.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs h-8 px-3 font-medium"
                >
                  {React.createElement(getUpgradeButtonIcon(), { className: "h-3 w-3 mr-1" })}
                  {getUpgradeButtonText()}
                </Button>
              )}
            </div>
            <Progress
              value={usage.storage.percentage}
              className="h-2"
            />
            <p className="text-sm text-muted-foreground">
              {usage.storage.percentage}% {t('used')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
