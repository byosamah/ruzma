
import React, { useState } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { CurrencyCode } from '@/lib/currency';
import ProjectHeaderInfo from './ProjectHeaderInfo';
import ProjectHeaderActions from './ProjectHeaderActions';
import ProjectStats from './ProjectStats';
import ProjectProgressBar from './ProjectProgressBar';

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

  if (isMobile) {
    return (
      <div className="space-y-6">
        {/* Project Title and Actions */}
        <div className="flex items-start justify-between">
          <ProjectHeaderInfo project={project} isMobile={isMobile} />
          <ProjectHeaderActions
            project={project}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            isMobile={isMobile}
          />
        </div>

        {/* Project Stats */}
        <ProjectStats project={project} isMobile={isMobile} userCurrency={userCurrency} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <ProjectHeaderInfo project={project} isMobile={isMobile} />
        
        {/* Action Buttons */}
        <ProjectHeaderActions
          project={project}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          isMobile={isMobile}
        />
      </div>

      {/* Project Stats */}
      <ProjectStats project={project} isMobile={isMobile} userCurrency={userCurrency} />

      {/* Progress Bar */}
      <ProjectProgressBar project={project} />
    </div>
  );
};

export default ProjectHeader;
