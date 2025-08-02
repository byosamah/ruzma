
import React from 'react';
import { motion } from 'framer-motion';
import { Milestone } from '@/components/MilestoneCard/types';
import MilestoneCard from '@/components/MilestoneCard';
import { CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface ProjectMilestonesListProps {
  milestones: any[]; // Using any[] to match the database structure
  onPaymentUpload: (milestoneId: string, file: File) => Promise<boolean>;
  onRevisionRequest?: (milestoneId: string, feedback: string, images: string[]) => Promise<void>;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
  token?: string; // Client access token
}

const ProjectMilestonesList: React.FC<ProjectMilestonesListProps> = ({
  milestones,
  onPaymentUpload,
  onRevisionRequest,
  currency,
  freelancerCurrency,
  branding,
  paymentProofRequired = false,
  token,
}) => {
  const t = useT();

  // Transform database milestones to match expected Milestone interface
  const transformedMilestones: Milestone[] = milestones.map(milestone => ({
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    price: milestone.price,
    status: milestone.status,
    deliverable_link: milestone.deliverable_link,
    paymentProofUrl: milestone.payment_proof_url,
    start_date: milestone.start_date,
    end_date: milestone.end_date,
    created_at: milestone.created_at,
    updated_at: milestone.updated_at,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (milestones.length === 0) {
    return (
      <motion.div 
        className="card bg-base-100 shadow-sm border border-base-300/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-body text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-base-200 rounded-full flex items-center justify-center">
            <ListTodo className="w-10 h-10 text-base-content/40" />
          </div>
          <h3 className="text-xl font-semibold text-base-content mb-2">
            No Milestones Yet
          </h3>
          <p className="text-base-content/60">
            {t('noMilestonesFound')}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Section Header */}
      <motion.div 
        className="text-center space-y-4"
        variants={itemVariants}
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <ListTodo className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-base-content">
            {t('projectMilestones')}
          </h2>
        </div>
        
        {/* Progress Summary */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-base-content/70">
              {milestones.filter(m => m.status === 'approved').length} {t('completed')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-base-content/70">
              {milestones.filter(m => m.status !== 'approved').length} {t('pending')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Milestones List */}
      <motion.div className="space-y-4" variants={containerVariants}>
        {transformedMilestones.map((milestone, index) => (
          <motion.div 
            key={milestone.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-all">
              <div className="card-body p-0">
                <MilestoneCard
                  milestone={milestone}
                  isClient={true}
                  onPaymentUpload={onPaymentUpload}
                  onRevisionRequest={onRevisionRequest}
                  currency={currency}
                  freelancerCurrency={freelancerCurrency}
                  branding={branding}
                  paymentProofRequired={paymentProofRequired}
                  token={token}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ProjectMilestonesList;
