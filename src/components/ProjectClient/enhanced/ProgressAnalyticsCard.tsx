import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { DatabaseProject } from '@/types/shared';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { formatDate, calculateDuration, isOverdue } from '@/lib/utils/dateUtils';

interface ProgressAnalyticsCardProps {
  project: DatabaseProject;
  currency: CurrencyCode;
}

const ProgressAnalyticsCard: React.FC<ProgressAnalyticsCardProps> = ({ project, currency }) => {
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const pendingMilestones = project.milestones.filter(m => m.status === 'pending').length;
  const inProgressMilestones = project.milestones.filter(m => 
    m.status === 'completed' || m.status === 'payment_submitted'
  ).length;

  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedValue = project.milestones
    .filter(m => m.status === 'approved')
    .reduce((sum, m) => sum + m.price, 0);
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const valueProgress = totalValue > 0 ? (completedValue / totalValue) * 100 : 0;

  // Calculate estimated completion
  const overdueMilestones = project.milestones.filter(m => 
    m.end_date && isOverdue(m.end_date) && m.status !== 'approved'
  ).length;

  const nextMilestone = project.milestones.find(m => 
    m.status === 'pending' || m.status === 'completed'
  );

  return (
    <motion.section 
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center text-blue-900">
        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
        Project Progress Analytics
      </h3>
      
      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Milestone Progress */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Milestone Completion</span>
            <span className="text-lg font-bold text-gray-900">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {completedMilestones} of {totalMilestones} milestones completed
          </p>
        </div>

        {/* Value Progress */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Value Delivered</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(completedValue, currency)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${valueProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {Math.round(valueProgress)}% of {formatCurrency(totalValue, currency)} total value
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{completedMilestones}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{inProgressMilestones}</p>
          <p className="text-xs text-gray-600">In Progress</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-600">{pendingMilestones}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{overdueMilestones}</p>
          <p className="text-xs text-gray-600">Overdue</p>
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
          <h4 className="font-semibold text-gray-900 mb-2">Next Milestone</h4>
          <p className="text-sm text-gray-700 mb-1">{nextMilestone.title}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {nextMilestone.end_date ? `Due: ${formatDate(nextMilestone.end_date)}` : 'No deadline set'}
            </span>
            <span className="font-medium text-blue-600">
              {formatCurrency(nextMilestone.price, currency)}
            </span>
          </div>
        </div>
      )}

      {/* Warning for overdue items */}
      {overdueMilestones > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {overdueMilestones} milestone{overdueMilestones > 1 ? 's are' : ' is'} past the deadline. 
            Please reach out to discuss revised timelines.
          </p>
        </div>
      )}
    </motion.section>
  );
};

export default ProgressAnalyticsCard;