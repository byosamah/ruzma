import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Circle, AlertCircle, Calendar } from 'lucide-react';
import { DatabaseProject, DatabaseMilestone } from '@/types/shared';
import { formatDate, isOverdue, getDaysUntilDeadline } from '@/lib/utils/dateUtils';
import { formatCurrency, CurrencyCode } from '@/lib/currency';

interface TimelineVisualizationProps {
  project: DatabaseProject;
  currency: CurrencyCode;
}

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({ project, currency }) => {
  // Sort milestones by start date or creation order
  const sortedMilestones = [...project.milestones].sort((a, b) => {
    if (a.start_date && b.start_date) {
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const getStatusIcon = (milestone: DatabaseMilestone) => {
    switch (milestone.status) {
      case 'approved':
        return { icon: CheckCircle2, color: 'green', bgColor: 'bg-green-100' };
      case 'completed':
      case 'payment_submitted':
        return { icon: Clock, color: 'blue', bgColor: 'bg-blue-100' };
      case 'pending':
      default:
        return { icon: Circle, color: 'gray', bgColor: 'bg-gray-100' };
    }
  };

  const getTimelineStatus = (milestone: DatabaseMilestone, index: number) => {
    const isOverdueItem = milestone.end_date && isOverdue(milestone.end_date) && milestone.status !== 'approved';
    const daysUntil = milestone.end_date ? getDaysUntilDeadline(milestone.end_date) : null;
    
    return {
      isOverdue: isOverdueItem,
      daysUntil,
      isActive: milestone.status === 'completed' || milestone.status === 'payment_submitted',
      isCompleted: milestone.status === 'approved',
      isPending: milestone.status === 'pending'
    };
  };

  return (
    <motion.section 
      className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-primary" />
        Project Timeline Visualization
      </h3>
      
      {/* Project Duration Overview */}
      {project.start_date && project.end_date && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Project Duration</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(project.start_date)} → {formatDate(project.end_date)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Status</p>
              <p className={`text-lg font-bold ${
                isOverdue(project.end_date) ? 'text-red-600' : 'text-green-600'
              }`}>
                {isOverdue(project.end_date) ? 'Overdue' : 'On Track'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {sortedMilestones.map((milestone, index) => {
            const statusIcon = getStatusIcon(milestone);
            const timelineStatus = getTimelineStatus(milestone, index);
            
            return (
              <motion.div
                key={milestone.id}
                className="relative flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Timeline Dot */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${statusIcon.bgColor} border-4 border-white shadow-sm`}>
                  <statusIcon.icon className={`w-5 h-5 text-${statusIcon.color}-600`} />
                  {timelineStatus.isOverdue && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Timeline Content */}
                <div className="flex-1 ml-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    timelineStatus.isCompleted ? 'border-green-200 bg-green-50' :
                    timelineStatus.isActive ? 'border-blue-200 bg-blue-50' :
                    timelineStatus.isOverdue ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(milestone.price, currency)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          timelineStatus.isCompleted ? 'bg-green-100 text-green-800' :
                          timelineStatus.isActive ? 'bg-blue-100 text-blue-800' :
                          timelineStatus.isOverdue ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status === 'approved' ? 'Completed' :
                           milestone.status === 'completed' ? 'Delivered' :
                           milestone.status === 'payment_submitted' ? 'Payment Submitted' :
                           'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {milestone.start_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Start: {formatDate(milestone.start_date)}</span>
                        </div>
                      )}
                      {milestone.end_date && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className={timelineStatus.isOverdue ? 'text-red-600 font-medium' : ''}>
                            Due: {formatDate(milestone.end_date)}
                          </span>
                        </div>
                      )}
                      {timelineStatus.daysUntil !== null && !timelineStatus.isCompleted && (
                        <div className={`flex items-center font-medium ${
                          timelineStatus.isOverdue ? 'text-red-600' : 
                          timelineStatus.daysUntil <= 3 ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          {timelineStatus.isOverdue ? (
                            <span>Overdue by {Math.abs(timelineStatus.daysUntil)} days</span>
                          ) : timelineStatus.daysUntil === 0 ? (
                            <span>Due today</span>
                          ) : (
                            <span>{timelineStatus.daysUntil} days remaining</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Deliverable Links */}
                    {milestone.deliverable_link && milestone.status === 'completed' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Deliverables available</p>
                        <div className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-700 font-medium">Work completed - view deliverables above</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Timeline Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {sortedMilestones.filter(m => m.status === 'approved').length}
            </p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {sortedMilestones.filter(m => m.status === 'completed' || m.status === 'payment_submitted').length}
            </p>
            <p className="text-xs text-gray-600">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">
              {sortedMilestones.filter(m => m.status === 'pending').length}
            </p>
            <p className="text-xs text-gray-600">Upcoming</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {sortedMilestones.filter(m => m.end_date && isOverdue(m.end_date) && m.status !== 'approved').length}
            </p>
            <p className="text-xs text-gray-600">Overdue</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TimelineVisualization;