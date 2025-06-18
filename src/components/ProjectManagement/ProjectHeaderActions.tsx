
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreVertical, Copy, Link, Mail } from 'lucide-react';
import { DatabaseProject } from '@/hooks/projectTypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectCardActions } from '@/components/ProjectCard/useProjectCardActions';

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
  const {
    handleCopyClientLink,
    handleViewClientPage,
    handleSendClientLink,
  } = useProjectCardActions(
    project,
    () => {}, // onViewClick not needed here
    () => onEditClick(), // onEditClick
    onDeleteClick ? () => onDeleteClick() : undefined // onDeleteClick
  );

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEditClick}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyClientLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Client Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewClientPage}>
            <Link className="w-4 h-4 mr-2" />
            View Client Page
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendClientLink}>
            <Mail className="w-4 h-4 mr-2" />
            Send Client Link
          </DropdownMenuItem>
          {onDeleteClick && (
            <DropdownMenuItem onClick={onDeleteClick} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onEditClick}
        className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300"
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyClientLink}
        className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300"
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy Client Link
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewClientPage}
        className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300"
      >
        <Link className="w-4 h-4 mr-2" />
        View Client Page
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSendClientLink}
        className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300"
      >
        <Mail className="w-4 h-4 mr-2" />
        Send Link
      </Button>
      {onDeleteClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteClick}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      )}
    </div>
  );
};

export default ProjectHeaderActions;
