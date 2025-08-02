import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { DatabaseProject } from '@/types/shared';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { formatDate, calculateDuration, isOverdue, getDaysUntilDeadline } from '@/lib/utils/dateUtils';

interface ProjectSummaryCardProps {
  project: DatabaseProject;
  currency: CurrencyCode;
}

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ project, currency }) => {
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedValue = project.milestones
    .filter(m => m.status === 'approved')
    .reduce((sum, m) => sum + m.price, 0);
  
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const isProjectOverdue = project.end_date ? isOverdue(project.end_date) : false;
  const daysRemaining = project.end_date ? getDaysUntilDeadline(project.end_date) : null;

  const getProjectStatus = () => {
    if (completedMilestones === totalMilestones) {
      return { label: 'Completed', color: 'green', icon: CheckCircle2 };
    }
    if (isProjectOverdue) {
      return { label: 'Overdue', color: 'red', icon: AlertCircle };
    }
    if (completedMilestones > 0) {
      return { label: 'In Progress', color: 'blue', icon: TrendingUp };
    }
    return { label: 'Starting Soon', color: 'gray', icon: Clock };
  };

  const status = getProjectStatus();

  const keyMetrics = [
    {
      label: 'Total Value',
      value: formatCurrency(totalValue, currency),
      icon: DollarSign,
      color: 'green',
      subValue: `${completedMilestones}/${totalMilestones} milestones`
    },
    {
      label: 'Progress',
      value: `${Math.round(progressPercentage)}%`,
      icon: Target,
      color: 'blue',
      subValue: formatCurrency(completedValue, currency) + ' earned'
    },
    {
      label: 'Duration',
      value: project.start_date && project.end_date 
        ? calculateDuration(project.start_date, project.end_date)
        : 'Not set',
      icon: Calendar,
      color: 'purple',
      subValue: daysRemaining !== null 
        ? (daysRemaining >= 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days over`)
        : 'No deadline'
    }
  ];

  return (
    <motion.section 
      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6 mb-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Project Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h2>
          {project.brief && (
            <p className="text-gray-600 leading-relaxed">{project.brief}</p>
          )}
        </div>
        <div className="ml-6">
          <div className={`inline-flex items-center px-3 py-2 rounded-full bg-${status.color}-100`}>
            <status.icon className={`w-4 h-4 text-${status.color}-600 mr-2`} />
            <span className={`text-sm font-medium text-${status.color}-800`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {keyMetrics.map(metric => (
          <div key={metric.label} className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                {metric.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-xs text-gray-500">{metric.subValue}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Project Dates */}
      {(project.start_date || project.end_date) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.start_date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Project Started</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(project.start_date)}</p>
                </div>
              </div>
            )}
            {project.end_date && (
              <div className="flex items-center">
                <Clock className={`w-4 h-4 mr-2 ${isProjectOverdue ? 'text-red-500' : 'text-gray-500'}`} />
                <div>
                  <p className="text-xs text-gray-500">
                    {isProjectOverdue ? 'Was Due' : 'Due Date'}
                  </p>
                  <p className={`text-sm font-medium ${isProjectOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(project.end_date)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          What's Next?
        </h4>
        <div className="text-sm text-blue-800">
          {completedMilestones === totalMilestones ? (
            <p>🎉 Project completed! All milestones have been delivered and approved.</p>
          ) : project.milestones.some(m => m.status === 'completed' && !m.payment_proof_url) ? (
            <p>📤 Upload payment proof for completed milestones to proceed.</p>
          ) : project.milestones.some(m => m.status === 'completed') ? (
            <p>⏳ Payment proofs are being reviewed. You'll be notified once approved.</p>
          ) : (
            <p>🚀 Work is in progress. You'll be notified when milestones are ready for review.</p>
          )}
        </div>
      </div>

      {/* Warning for overdue project */}
      {isProjectOverdue && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            This project is past its deadline. Please contact your freelancer to discuss timeline adjustments.
          </p>
        </div>
      )}
    </motion.section>
  );
};

export default ProjectSummaryCard;