
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Download } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';

interface ProjectPaymentDeliveryCardProps {
  paymentProofRequired?: boolean;
  branding?: FreelancerBranding | null;
}

const ProjectPaymentDeliveryCard: React.FC<ProjectPaymentDeliveryCardProps> = ({
  paymentProofRequired = false,
}) => {
  const t = useT();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Payment Security */}
      {paymentProofRequired && (
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-900">
              <Shield className="w-4 h-4 text-blue-600" />
              {t('securePayments')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-blue-800 leading-relaxed">
              {t('uploadProofOfPaymentForEachMilestone')}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Deliverable Access */}
      <Card className="bg-green-50 border border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-900">
            <Download className="w-4 h-4 text-green-600" />
            {t('instantAccess')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-green-800 leading-relaxed">
            {paymentProofRequired 
              ? t('downloadDeliverablesAfterPaymentApproval')
              : t('downloadDeliverablesImmediately')
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPaymentDeliveryCard;
