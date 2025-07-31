
import React from 'react';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useIsMobile } from '@/hooks/use-mobile';
import { useT } from '@/lib/i18n';

interface ProjectCardActionsHeaderProps {
  onEditClick: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
}

const ProjectCardActionsHeader: React.FC<ProjectCardActionsHeaderProps> = ({
  onEditClick,
  onDeleteClick
}) => {
  const isMobile = useIsMobile();
  const t = useT();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete button clicked'); // Debug log
    if (onDeleteClick) {
      onDeleteClick(e);
    }
  };

  return (
    <div className="flex gap-2 shrink-0">
      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "sm"} 
        onClick={onEditClick} 
        className="flex items-center gap-1 min-w-[44px] min-h-[44px] touch-manipulation"
      >
        <span className="text-lg">✏️</span>
      </Button>
      
      {onDeleteClick && (
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "sm"} 
          onClick={handleDeleteClick}
          className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 min-w-[44px] min-h-[44px] touch-manipulation"
        >
          <span className="text-lg">🗑️</span>
        </Button>
      )}
    </div>
  );
};

export default ProjectCardActionsHeader;
