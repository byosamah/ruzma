
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectCardActionsHeaderProps {
  onEditClick: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
}

const ProjectCardActionsHeader: React.FC<ProjectCardActionsHeaderProps> = ({
  onEditClick,
  onDeleteClick
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex gap-2 shrink-0">
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "sm"} 
        onClick={onEditClick} 
        className="flex items-center gap-1 min-w-[44px] min-h-[44px] touch-manipulation"
      >
        <Edit className="w-4 h-4" />
        {!isMobile && <span className="hidden sm:inline">Edit</span>}
      </Button>
      
      {onDeleteClick && (
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "sm"} 
          onClick={onDeleteClick} 
          className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 min-w-[44px] min-h-[44px] touch-manipulation"
        >
          <Trash2 className="w-4 h-4" />
          {!isMobile && <span className="hidden sm:inline">Delete</span>}
        </Button>
      )}
    </div>
  );
};

export default ProjectCardActionsHeader;
