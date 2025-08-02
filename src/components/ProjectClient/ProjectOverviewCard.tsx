
import React from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { format } from 'date-fns';
import { FreelancerBranding } from '@/types/branding';
import { Calendar, DollarSign, Target, TrendingUp } from 'lucide-react';

interface ProjectOverviewCardProps {
  projectName: string;
  projectBrief?: string;
  totalValue: number;
  totalMilestones: number;
  completedMilestones: number;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  startDate?: string;
  endDate?: string;
  branding?: FreelancerBranding | null;
}

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({
  projectName,
  projectBrief,
  totalValue,
  totalMilestones,
  completedMilestones,
  currency,
  startDate,
  endDate,
}) => {
  const t = useT();
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')}`;
    } else if (startDate) {
      return `${t('starts')} ${format(new Date(startDate), 'MMM d, yyyy')}`;
    } else if (endDate) {
      return `${t('ends')} ${format(new Date(endDate), 'MMM d, yyyy')}`;
    }
    return t('noDateSet');
  };

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

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero Project Card */}
      <motion.div 
        className="card bg-base-100 shadow-sm border border-base-300/50"
        variants={itemVariants}
      >
        <div className="card-body p-6 sm:p-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-base-content">
              {projectName}
            </h2>
            {projectBrief && (
              <p className="text-base-content/70 text-lg max-w-3xl mx-auto leading-relaxed">
                {projectBrief}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Clean Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Total Value */}
        <motion.div 
          className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="card-body p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-success/10 rounded-full">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="stat-title text-xs font-medium text-base-content/60 uppercase tracking-wide">
              {t('totalValue')}
            </div>
            <div className="stat-value text-2xl font-bold text-success">
              {formatCurrency(totalValue, currency)}
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div 
          className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="card-body p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="stat-title text-xs font-medium text-base-content/60 uppercase tracking-wide">
              {t('progress')}
            </div>
            <div className="stat-value text-2xl font-bold text-primary">
              {completedMilestones}/{totalMilestones}
            </div>
            <div className="stat-desc text-sm text-base-content/50">
              {t('milestones')}
            </div>
          </div>
        </motion.div>

        {/* Completion Percentage */}
        <motion.div 
          className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="card-body p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-info/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
            </div>
            <div className="stat-title text-xs font-medium text-base-content/60 uppercase tracking-wide">
              {t('completed')}
            </div>
            <div className="stat-value text-2xl font-bold text-info">
              {Math.round(progressPercentage)}%
            </div>
            {/* Progress bar */}
            <div className="mt-2">
              <progress 
                className="progress progress-info w-full h-2" 
                value={progressPercentage} 
                max="100"
              />
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        {(startDate || endDate) && (
          <motion.div 
            className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="card-body p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Calendar className="w-6 h-6 text-warning" />
                </div>
              </div>
              <div className="stat-title text-xs font-medium text-base-content/60 uppercase tracking-wide">
                {t('timeline')}
              </div>
              <div className="stat-value text-base font-semibold text-warning">
                {formatDateRange()}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProjectOverviewCard;
