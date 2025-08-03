
import React from 'react';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { StatCard } from '@/components/shared';

interface ProjectPaymentDeliveryCardProps {
  paymentProofRequired?: boolean;
  branding?: FreelancerBranding | null;
}

const ProjectPaymentDeliveryCard: React.FC<ProjectPaymentDeliveryCardProps> = ({
  paymentProofRequired = false,
}) => {
  const t = useT();

  if (!paymentProofRequired) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard
        emoji="🔒"
        title={t('securePayments')}
        value={t('uploadProofOfPaymentForEachMilestone')}
      />
      
      <StatCard
        emoji="⚡"
        title={t('instantAccess')}
        value={t('downloadDeliverablesAfterPaymentApproval')}
      />
    </div>
  );
};

export default ProjectPaymentDeliveryCard;
