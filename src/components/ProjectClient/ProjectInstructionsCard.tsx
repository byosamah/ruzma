
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';

interface ProjectInstructionsCardProps {
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

function ProjectInstructionsCard({
  paymentProofRequired = false,
}: ProjectInstructionsCardProps) {
  const t = useT();

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">
          ℹ️ {t('howItWorks')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-border flex-shrink-0 mt-0.5">
              1
            </div>
            <p className="text-sm text-muted-foreground">
              {t('trackProgressOfEachMilestone')}
            </p>
          </div>
          
          {paymentProofRequired && (
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-border flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-muted-foreground">
                {t('uploadPaymentProofWhenRequested')}
              </p>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-border flex-shrink-0 mt-0.5">
              {paymentProofRequired ? '3' : '2'}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('downloadDeliverablesWhenReady')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(ProjectInstructionsCard);
