
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';

interface ProjectInstructionsCardProps {
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

const ProjectInstructionsCard: React.FC<ProjectInstructionsCardProps> = ({
  paymentProofRequired = false,
}) => {
  const t = useT();

  return (
    <Card className="bg-muted border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900">
          <Info className="w-4 h-4 text-gray-600" />
          {t('howItWorks')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-border flex-shrink-0 mt-0.5">
              1
            </div>
            <p className="text-sm text-gray-600">
              {t('trackProgressOfEachMilestone')}
            </p>
          </div>
          
          {paymentProofRequired && (
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-border flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-gray-600">
                {t('uploadPaymentProofWhenRequested')}
              </p>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-border flex-shrink-0 mt-0.5">
              {paymentProofRequired ? '3' : '2'}
            </div>
            <p className="text-sm text-gray-600">
              {t('downloadDeliverablesWhenReady')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInstructionsCard;
