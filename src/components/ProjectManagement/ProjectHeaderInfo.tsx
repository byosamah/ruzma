
import React from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';

interface ProjectHeaderInfoProps {
  project: DatabaseProject;
  isMobile: boolean;
}

const ProjectHeaderInfo: React.FC<ProjectHeaderInfoProps> = ({ project, isMobile }) => {
  if (isMobile) {
    return (
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight break-words">
          {project.name}
        </h1>
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">{project.brief}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex items-center space-x-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-600 mt-1">{project.brief}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeaderInfo;
