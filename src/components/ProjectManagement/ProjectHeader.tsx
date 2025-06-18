
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink, Send } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';
import { supabase } from '@/integrations/supabase/client';

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

  const handleCopyClientLink = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success('Client link copied to clipboard');
  };

  const handleViewClientPage = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    window.open(clientUrl, '_blank');
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
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          {t('editProject')}
        </Button>
        {onDeleteClick && (
          <Button
            variant="outline"
            onClick={onDeleteClick}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;
