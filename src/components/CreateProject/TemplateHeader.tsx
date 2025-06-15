
import React from 'react';
import { useT } from '@/lib/i18n';

interface TemplateHeaderProps {
  hasTemplate: boolean;
}

const TemplateHeader = ({ hasTemplate }: TemplateHeaderProps) => {
  const t = useT();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        {hasTemplate ? 'Create Project from Template' : t('createNewProject')}
      </h1>
      <p className="text-slate-600 mt-2">
        {hasTemplate ? 'Customize the template and create your project' : t('setupProjectMilestones')}
      </p>
    </div>
  );
};

export default TemplateHeader;
