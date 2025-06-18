
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, Copy, Link } from 'lucide-react';

interface ProjectCardActionsProps {
  onEditClick: (e: React.MouseEvent) => void;
  onViewClick: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
  onCopyClientLink: (e: React.MouseEvent) => void;
  onViewClientPage: (e: React.MouseEvent) => void;
  showClientActions?: boolean;
  variant?: 'header' | 'footer';
}

const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  onEditClick,
  onViewClick,
  onDeleteClick,
  onCopyClientLink,
  onViewClientPage,
  showClientActions = false,
  variant = 'header'
}) => {
  if (variant === 'header') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEditClick} className="flex items-center gap-1">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onViewClick} className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300">
          <Eye className="w-4 h-4" />
          View
        </Button>
        {onDeleteClick && (
          <Button variant="outline" size="sm" onClick={onDeleteClick} className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  if (showClientActions) {
    return (
      <div className="flex gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onCopyClientLink} className="flex items-center gap-1 flex-1">
          <Copy className="w-4 h-4" />
          Copy Client Link
        </Button>
        <Button variant="outline" size="sm" onClick={onViewClientPage} className="flex items-center gap-1 flex-1">
          <Link className="w-4 h-4" />
          View Client Page
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" onClick={onCopyClientLink} className="flex items-center gap-1">
        <Copy className="w-4 h-4" />
        Copy Client Link
      </Button>
      <Button variant="outline" size="sm" onClick={onViewClientPage} className="flex items-center gap-1">
        <Link className="w-4 h-4" />
        View Client Page
      </Button>
    </div>
  );
};

export default ProjectCardActions;
