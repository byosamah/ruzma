
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink, Send, Copy } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/types/shared';
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';
import { supabase } from '@/integrations/supabase/client';

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
  const t = useT();

  const handleViewProjectPage = () => {
    // Use the full client_access_token directly
    const clientUrl = `https://hub.ruzma.co/client/project/${project.client_access_token}`;
    window.open(clientUrl, '_blank');
  };

  const handleCopyClientLink = async () => {
    // Use the full client_access_token directly
    const clientUrl = `https://hub.ruzma.co/client/project/${project.client_access_token}`;
    try {
      await navigator.clipboard.writeText(clientUrl);
      toast.success(t('clientLinkCopied'));
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSendClientLink = async () => {
    if (!project.client_email) {
      toast.error(t('noClientEmailFound'));
      return;
    }

    try {
      toast.loading(t('sendingClientLink'));
      
      const { data: { user } } = await supabase.auth.getUser();
      
      await sendClientLink({
        clientEmail: project.client_email,
        projectName: project.name,
        freelancerName: 'Your freelancer',
        clientToken: project.client_access_token, // Use full token directly
        userId: user?.id,
      });

      toast.dismiss();
      toast.success(t('clientLinkSent'));
    } catch (error: any) {
      toast.dismiss();
      
      if (error.message && error.message.includes('Domain verification required')) {
        toast.error(t('emailDomainVerificationRequired'));
      } else {
        toast.error(t('clientLinkSendFailed'));
      }
      
      console.error('Error sending client link:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleViewProjectPage}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        {t('viewClientPage')}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSendClientLink}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        <Send className="w-4 h-4 mr-2" />
        {t('sendToClient')}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyClientLink}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        <Copy className="w-4 h-4 mr-2" />
        {t('copyLink')}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        <Edit className="w-4 h-4 mr-2" />
        {t('edit')}
      </Button>
      
      {onDeleteClick && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteClick}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('delete')}
        </Button>
      )}
    </div>
  );
};

export default ProjectHeaderActions;
