
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Send } from 'lucide-react';

interface ProjectCardActionsFooterProps {
  onCopyClientLink: (e: React.MouseEvent) => void;
  onViewClientPage: (e: React.MouseEvent) => void;
  onSendClientLink?: (e: React.MouseEvent) => void;
  showClientActions?: boolean;
}

const ProjectCardActionsFooter: React.FC<ProjectCardActionsFooterProps> = ({
  onCopyClientLink,
  onViewClientPage,
  onSendClientLink,
  showClientActions = false
}) => {
  if (!showClientActions) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopyClientLink}
        className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-0"
      >
        <Copy className="mr-1.5 h-3 w-3" />
        Copy Link
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewClientPage}
        className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-0"
      >
        <ExternalLink className="mr-1.5 h-3 w-3" />
        View Page
      </Button>

      {onSendClientLink && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSendClientLink}
          className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-0"
        >
          <Send className="mr-1.5 h-3 w-3" />
          Send Link
        </Button>
      )}
    </div>
  );
};

export default ProjectCardActionsFooter;
