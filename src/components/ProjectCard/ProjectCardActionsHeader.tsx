
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardActionsHeaderProps {
  onEditClick: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
}

const ProjectCardActionsHeader: React.FC<ProjectCardActionsHeaderProps> = ({
  onEditClick,
  onDeleteClick
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-100 shadow-lg">
        <DropdownMenuItem onClick={onEditClick} className="text-sm text-gray-700 hover:bg-gray-50">
          <Edit className="mr-2 h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        {onDeleteClick && (
          <DropdownMenuItem onClick={onDeleteClick} className="text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectCardActionsHeader;
