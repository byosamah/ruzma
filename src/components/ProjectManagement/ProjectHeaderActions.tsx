
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';

interface ProjectHeaderActionsProps {
  project: DatabaseProject;
  onEditClick: () => void;
  onDeleteClick?: () => void;
  isMobile: boolean;
}

const ProjectHeaderActions: React.FC<ProjectHeaderActionsProps> = ({
  project,
  onEditClick,
  onDeleteClick,
  isMobile
}) => {
  const t = useT();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        className="text-gray-600 hover:text-gray-900"
      >
        <Edit className="w-4 h-4 mr-2" />
        {t('edit')}
      </Button>
      
      {onDeleteClick && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteClick}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('delete')}
        </Button>
      )}
    </div>
  );
};

export default ProjectHeaderActions;
