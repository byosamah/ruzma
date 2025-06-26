
import React, { useState } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { CurrencyCode } from '@/lib/currency';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, DollarSign } from 'lucide-react';
import ProjectHeaderInfo from './ProjectHeaderInfo';
import ProjectStats from './ProjectStats';

interface ProjectHeaderProps {
  project: DatabaseProject;
  onBackClick: () => void;
  onEditClick: () => void;
  onDeleteClick?: () => void;
  userCurrency: CurrencyCode;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onBackClick,
  onEditClick,
  onDeleteClick,
  userCurrency
}) => {
  const isMobile = useIsMobile();
  
  // Calculate stats
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedValue = project.milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.price, 0);

  if (isMobile) {
    return (
      <div className="space-y-6">
        {/* Project Title and Actions */}
        <div className="flex items-start justify-between">
          <ProjectHeaderInfo 
            project={project} 
            isMobile={isMobile}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        </div>

        {/* Stats under brief */}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {completedMilestones}/{project.milestones.length}
              </p>
              <p className="text-xs text-gray-600">Progress</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {userCurrency}${totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Total Value</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                {userCurrency}${completedValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Completed Value</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <ProjectHeaderInfo 
          project={project} 
          isMobile={isMobile}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      </div>

      {/* Stats under brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedMilestones}/{project.milestones.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {userCurrency}${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {userCurrency}${completedValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
