import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { DatabaseProject } from '@/types/shared';
import { formatDate, calculateDuration, isOverdue, getDaysUntilDeadline } from '@/lib/utils/dateUtils';

interface ProjectTimelineCardProps {
  project: DatabaseProject;
}

const ProjectTimelineCard: React.FC<ProjectTimelineCardProps> = ({ project }) => {
  if (!project.start_date && !project.end_date) {
    return null;
  }

  const isProjectOverdue = project.end_date ? isOverdue(project.end_date) : false;
  const daysUntilDeadline = project.end_date ? getDaysUntilDeadline(project.end_date) : 0;

  return (
    <motion.section 
      className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-primary" />
        Project Timeline
      </h3>
      
      <div className="grid md:grid-cols-3 gap-4">
        {project.start_date && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 mr-2 text-green-600" />
              <p className="text-sm font-medium text-gray-600">Start Date</p>
            </div>
            <p className="font-semibold text-gray-900">{formatDate(project.start_date)}</p>
          </div>
        )}
        
        {project.end_date && (
          <div className={`rounded-lg p-4 ${isProjectOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-2">
              {isProjectOverdue ? (
                <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              ) : (
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              )}
              <p className={`text-sm font-medium ${isProjectOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                {isProjectOverdue ? 'Overdue' : 'Deadline'}
              </p>
            </div>
            <p className={`font-semibold ${isProjectOverdue ? 'text-red-900' : 'text-gray-900'}`}>
              {formatDate(project.end_date)}
            </p>
            {!isProjectOverdue && daysUntilDeadline >= 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {daysUntilDeadline === 0 ? 'Due today' : `${daysUntilDeadline} days left`}
              </p>
            )}
          </div>
        )}
        
        {project.start_date && project.end_date && (
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              <p className="text-sm font-medium text-primary">Duration</p>
            </div>
            <p className="font-semibold text-gray-900">
              {calculateDuration(project.start_date, project.end_date)}
            </p>
          </div>
        )}
      </div>
      
      {isProjectOverdue && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            This project deadline has passed. Please contact your freelancer for an updated timeline.
          </p>
        </div>
      )}
    </motion.section>
  );
};

export default ProjectTimelineCard;