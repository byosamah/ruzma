
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Link, Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  if (showClientActions) {
    return (
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} pt-3 border-t border-slate-100`}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCopyClientLink} 
          className={`flex items-center gap-2 ${isMobile ? 'w-full justify-start min-h-[44px]' : 'flex-1'} touch-manipulation`}
        >
          <Copy className="w-4 h-4 shrink-0" />
          <span className={isMobile ? 'text-sm' : 'text-xs'}>Copy Link</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewClientPage} 
          className={`flex items-center gap-2 ${isMobile ? 'w-full justify-start min-h-[44px]' : 'flex-1'} touch-manipulation`}
        >
          <Link className="w-4 h-4 shrink-0" />
          <span className={isMobile ? 'text-sm' : 'text-xs'}>View Page</span>
        </Button>
        
        {onSendClientLink && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSendClientLink} 
            className={`flex items-center gap-2 ${isMobile ? 'w-full justify-start min-h-[44px]' : 'flex-1'} touch-manipulation`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span className={isMobile ? 'text-sm' : 'text-xs'}>Send Link</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCopyClientLink} 
        className="flex items-center gap-2 w-full justify-start min-h-[44px] touch-manipulation"
      >
        <Copy className="w-4 h-4 shrink-0" />
        <span className="text-sm">Copy Client Link</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onViewClientPage} 
        className="flex items-center gap-2 w-full justify-start min-h-[44px] touch-manipulation"
      >
        <Link className="w-4 h-4 shrink-0" />
        <span className="text-sm">View Client Page</span>
      </Button>
      
      {onSendClientLink && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSendClientLink} 
          className="flex items-center gap-2 w-full justify-start min-h-[44px] touch-manipulation"
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span className="text-sm">Send to Client</span>
        </Button>
      )}
    </div>
  );
};

export default ProjectCardActionsFooter;
