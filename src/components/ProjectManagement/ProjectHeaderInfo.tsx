
import React from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import ProjectHeaderActions from './ProjectHeaderActions';

interface ProjectHeaderInfoProps {
  project: DatabaseProject;
  isMobile: boolean;
  onEditClick: () => void;
  onDeleteClick?: () => void;
}

const ProjectHeaderInfo: React.FC<ProjectHeaderInfoProps> = ({ 
  project, 
  isMobile, 
  onEditClick, 
  onDeleteClick 
}) => {
  if (isMobile) {
    return (
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight break-words">
          {project.name}
        </h1>
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">{project.brief}</p>
        
        {/* Action Buttons */}
        <div className="mt-4">
          <ProjectHeaderActions
            project={project}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex items-center space-x-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-600 mt-1">{project.brief}</p>
          
          {/* Action Buttons */}
          <div className="mt-4">
            <ProjectHeaderActions
              project={project}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeaderInfo;
