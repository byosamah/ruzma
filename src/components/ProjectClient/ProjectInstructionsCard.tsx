
import React from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { Info } from 'lucide-react';

interface ProjectInstructionsCardProps {
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

const ProjectInstructionsCard: React.FC<ProjectInstructionsCardProps> = ({
  paymentProofRequired = false,
}) => {
  const t = useT();

  const steps = [
    { text: t('trackProgressOfEachMilestone') },
    ...(paymentProofRequired ? [{ text: t('uploadPaymentProofWhenRequested') }] : []),
    { text: t('downloadDeliverablesWhenReady') }
  ];

  return (
    <motion.div 
      className="card bg-base-100 shadow-sm border border-base-300/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-body p-6">
        <h3 className="card-title text-lg mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-info" />
          {t('howItWorks')}
        </h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-base-content/70 text-sm leading-relaxed pt-1">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectInstructionsCard;
