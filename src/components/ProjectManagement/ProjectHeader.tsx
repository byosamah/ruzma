
import React from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { CurrencyCode } from '@/lib/currency';
import ProjectHeaderActions from './ProjectHeaderActions';

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
  return (
    <div className="space-y-4">
      {/* Project Title and Description */}
      <div>
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          {project.name}
        </h1>
        {project.brief && (
          <p className="text-gray-600 text-lg leading-relaxed">
            {project.brief}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <ProjectHeaderActions
        project={project}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        isMobile={false}
      />
    </div>
  );
};

export default ProjectHeader;
