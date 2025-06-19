
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FolderOpen, TrendingUp, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { DatabaseProject } from '@/hooks/projectTypes';

interface UsageIndicatorsProps {
  userProfile: any;
  projects: DatabaseProject[];
}

export const UsageIndicators: React.FC<UsageIndicatorsProps> = ({
  userProfile,
  projects,
}) => {
  const navigate = useNavigate();
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
    return userType === 'pro' ? 'Contact us' : 'Upgrade';
  };

  const getUpgradeButtonIcon = () => {
    const userType = userProfile?.user_type || 'free';
    return userType === 'pro' ? MessageCircle : TrendingUp;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {/* Projects Usage */}
      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">Projects Used</CardTitle>
          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {usage.projects.current} of {usage.projects.max}
              </span>
              {usage.projects.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs h-6 px-2"
                >
                  {React.createElement(getUpgradeButtonIcon(), { className: "h-3 w-3 mr-1" })}
                  {getUpgradeButtonText()}
                </Button>
              )}
            </div>
            <Progress
              value={usage.projects.percentage}
              className="h-1.5"
            />
            <p className="text-xs text-muted-foreground">
              {usage.projects.percentage}% used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card className="p-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">Storage Used</CardTitle>
          <Database className="h-3.5 w-3.5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {usage.storage.currentFormatted} of {usage.storage.maxFormatted}
              </span>
              {usage.storage.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs h-6 px-2"
                >
                  {React.createElement(getUpgradeButtonIcon(), { className: "h-3 w-3 mr-1" })}
                  {getUpgradeButtonText()}
                </Button>
              )}
            </div>
            <Progress
              value={usage.storage.percentage}
              className="h-1.5"
            />
            <p className="text-xs text-muted-foreground">
              {usage.storage.percentage}% used
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
