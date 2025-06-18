
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink, Send, MoreVertical } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectHeaderProps {
  project: DatabaseProject;
  onBackClick: () => void;
  onEditClick: () => void;
  onDeleteClick?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onBackClick,
  onEditClick,
  onDeleteClick
}) => {
  const t = useT();
  const isMobile = useIsMobile();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleCopyClientLink = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success('Client link copied to clipboard');
    setIsActionsOpen(false);
  };

  const handleViewClientPage = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    window.open(clientUrl, '_blank');
    setIsActionsOpen(false);
  };

  const handleSendClientLink = async () => {
    if (!project.client_email) {
      toast.error('No client email address found for this project');
      return;
    }

    try {
      toast.loading('Sending client link...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      await sendClientLink({
        clientEmail: project.client_email,
        projectName: project.name,
        freelancerName: 'Your freelancer',
        clientToken: project.client_access_token,
        userId: user?.id,
      });

      toast.dismiss();
      toast.success('Client link sent successfully!');
      setIsActionsOpen(false);
    } catch (error: any) {
      toast.dismiss();
      
      if (error.message && error.message.includes('Domain verification required')) {
        toast.error('Email domain needs verification. Please contact support.');
      } else {
        toast.error('Failed to send client link. Please try again.');
      }
      
      console.error('Error sending client link:', error);
    }
  };

  const handleEdit = () => {
    onEditClick();
    setIsActionsOpen(false);
  };

  const handleDelete = () => {
    if (onDeleteClick) {
      onDeleteClick();
    }
    setIsActionsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToDashboard')}
          </Button>
          <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleCopyClientLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Client Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendClientLink}>
                <Send className="w-4 h-4 mr-2" />
                Send Client Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewClientPage}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Client Page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              {onDeleteClick && (
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 leading-tight">{project.name}</h1>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed">{project.brief}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackClick}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToDashboard')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{project.name}</h1>
          <p className="text-slate-600 mt-1">{project.brief}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleCopyClientLink}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy Client Link
        </Button>
        <Button
          variant="outline"
          onClick={handleSendClientLink}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send Client Link
        </Button>
        <Button
          variant="outline"
          onClick={handleViewClientPage}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Client Page
        </Button>
        <Button
          variant="outline"
          onClick={onEditClick}
          size="icon"
        >
          <Edit className="w-4 h-4" />
        </Button>
        {onDeleteClick && (
          <Button
            variant="outline"
            onClick={onDeleteClick}
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;
