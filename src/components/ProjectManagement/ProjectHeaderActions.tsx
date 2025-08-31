
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink, Send, Copy, FileText } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';
import { supabase } from '@/integrations/supabase/client';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';

interface ProjectHeaderActionsProps {
  project: DatabaseProject;
  onEditClick: () => void;
  onDeleteClick?: () => void;
  isMobile: boolean;
}

function ProjectHeaderActions({
  project,
  onEditClick,
  onDeleteClick,
  isMobile
}: ProjectHeaderActionsProps) {
  const t = useT();
  const { navigate } = useLanguageNavigation();

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
      toast.error(t('failedToCopyLink'));
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send client link';
      toast.dismiss();
      toast.error(errorMessage);
    }
  };

  const handleCreateInvoice = () => {
    navigate(`/create-invoice?projectId=${project.id}`);
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
        onClick={handleCreateInvoice}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        <FileText className="w-4 h-4 mr-2" />
        {t('createInvoice')}
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
