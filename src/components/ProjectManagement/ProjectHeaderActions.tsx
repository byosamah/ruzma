
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
          <Button variant="ghost" size="sm" className="min-w-[44px] min-h-[44px] touch-manipulation">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
          <DropdownMenuItem onClick={onEditClick} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
            <Edit className="w-4 h-4" />
            <span>Edit Project</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyClientLink} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
            <Copy className="w-4 h-4" />
            <span>Copy Client Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewClientPage} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
            <Link className="w-4 h-4" />
            <span>View Client Page</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendClientLink} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
            <Mail className="w-4 h-4" />
            <span>Send Client Link</span>
          </DropdownMenuItem>
          {onDeleteClick && (
            <DropdownMenuItem onClick={onDeleteClick} className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
              <span>Delete Project</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
      {/* Show fewer buttons on medium screens, more on large screens */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyClientLink}
          className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300 min-h-[44px] touch-manipulation"
        >
          <Copy className="w-4 h-4 mr-2" />
          <span className="hidden lg:inline">Copy Client Link</span>
          <span className="lg:hidden">Copy</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewClientPage}
          className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300 min-h-[44px] touch-manipulation"
        >
          <Link className="w-4 h-4 mr-2" />
          <span className="hidden lg:inline">View Client Page</span>
          <span className="lg:hidden">View</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendClientLink}
          className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300 min-h-[44px] touch-manipulation"
        >
          <Mail className="w-4 h-4 mr-2" />
          <span className="hidden lg:inline">Send Link</span>
          <span className="lg:hidden">Send</span>
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onEditClick}
        className="text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300 min-h-[44px] touch-manipulation"
      >
        <Edit className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
      
      {onDeleteClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteClick}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 min-h-[44px] touch-manipulation"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      )}
      
      {/* Mobile dropdown for medium screens */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[44px] min-h-[44px] touch-manipulation">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
            <DropdownMenuItem onClick={handleCopyClientLink} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
              <Copy className="w-4 h-4" />
              <span>Copy Client Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewClientPage} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
              <Link className="w-4 h-4" />
              <span>View Client Page</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSendClientLink} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
              <Mail className="w-4 h-4" />
              <span>Send Client Link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectHeaderActions;
