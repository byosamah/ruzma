
import React from 'react';
import { Button } from '@/components/ui/button';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useT } from '@/lib/i18n';

interface ProjectHeaderProps {
  project: DatabaseProject;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const t = useT();

  return (
    <div className="p-5 rounded-lg bg-white/80 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name}</h1>
      <p className="text-slate-600 mb-4">{project.brief}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{t('projectId')}: {project.id}</span>
        <span className="text-slate-500">
          {t('created')}: {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="mt-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <a
            href={`/client/project/${project.client_access_token}`}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={0}
          >
            {t('openClientPage')}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ProjectHeader;
