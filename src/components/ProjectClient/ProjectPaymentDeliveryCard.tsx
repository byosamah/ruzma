
import React from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { Shield, Zap } from 'lucide-react';

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
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="card-body p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="card-title text-lg justify-center mb-2">
            {t('securePayments')}
          </h3>
          <p className="text-base-content/70 text-sm">
            {t('uploadProofOfPaymentForEachMilestone')}
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="card-body p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-success/10 rounded-full">
              <Zap className="w-6 h-6 text-success" />
            </div>
          </div>
          <h3 className="card-title text-lg justify-center mb-2">
            {t('instantAccess')}
          </h3>
          <p className="text-base-content/70 text-sm">
            {t('downloadDeliverablesAfterPaymentApproval')}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectPaymentDeliveryCard;
