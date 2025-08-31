
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
// Replaced icons with emojis
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/core/useAuth';
import { rateLimitService } from '@/services/core/RateLimitService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardHeaderButtonsProps {
  onNewProject: () => void;
  canCreateProject: boolean;
}

function DashboardHeaderButtons({
  onNewProject,
  canCreateProject
}: DashboardHeaderButtonsProps) {
  const t = useT();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    isNearLimit: boolean;
    remainingAttempts: number;
    resetTime: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      const status = rateLimitService.getRateLimitStatus(user.id, 'project_creation');
      setRateLimitStatus(status);
    }
  }, [user]);

  const formatResetTime = (resetTime: number) => {
    const minutesUntilReset = Math.ceil((resetTime - Date.now()) / (60 * 1000));
    return minutesUntilReset > 0 ? `${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}` : '0 minutes';
  };

  const NewProjectButton = () => {
    const button = (
      <Button 
        onClick={onNewProject} 
        disabled={!canCreateProject} 
        size="default"
        className={`${!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''} w-full min-h-[44px] px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium touch-manipulation`}
      >
        <span className="text-base sm:text-lg mr-2">✨</span>
        <span className="text-sm sm:text-base">{t('newProject')}</span>
      </Button>
    );

    if (!canCreateProject && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('projectLimitReached')}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <div className="flex flex-col items-center w-full gap-3">
      {/* Rate Limit Warning */}
      {rateLimitStatus?.isNearLimit && (
        <div className="w-full max-w-md">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-800 text-sm text-center">
              You have {rateLimitStatus.remainingAttempts} project creation attempts remaining. 
              Limit resets in {formatResetTime(rateLimitStatus.resetTime)}.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="w-full max-w-md">
        <NewProjectButton />
      </div>
    </div>
  );
};

export default DashboardHeaderButtons;
