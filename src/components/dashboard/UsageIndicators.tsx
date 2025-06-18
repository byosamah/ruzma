
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Projects Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects Used</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {usage.projects.current} of {usage.projects.max}
              </span>
              {usage.projects.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs"
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
            <p className="text-xs text-muted-foreground">
              {usage.projects.percentage}% of projects used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {usage.storage.currentFormatted} of {usage.storage.maxFormatted}
              </span>
              {usage.storage.percentage >= 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeClick}
                  className="text-xs"
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
            <p className="text-xs text-muted-foreground">
              {usage.storage.percentage}% of storage used
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
