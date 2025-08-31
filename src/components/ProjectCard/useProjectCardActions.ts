
import { useState } from 'react';
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';

export const useProjectCardActions = (
  project: DatabaseProject,
  onViewClick: (slug: string) => void,
  onEditClick: (slug: string) => void,
  onDeleteClick?: (id: string) => void
) => {
  const t = useT();
  const handleCopyClientLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use the full client_access_token directly
    const clientUrl = `https://hub.ruzma.co/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success(t('clientLinkCopied'));
  };

  const handleViewClientPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use the full client_access_token directly
    const clientUrl = `https://hub.ruzma.co/client/project/${project.client_access_token}`;
    window.open(clientUrl, '_blank');
  };

  const handleSendClientLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!project.client_email) {
      toast.error(t('noClientEmailFound') || 'No client email address found for this project');
      return;
    }

    try {
      toast.loading(t('sendingClientLink') || 'Sending client link...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      await sendClientLink({
        clientEmail: project.client_email,
        projectName: project.name,
        freelancerName: 'Your freelancer', // fallback name
        clientToken: project.client_access_token, // Use full token directly
        userId: user?.id,
      });

      toast.dismiss();
      toast.success(t('clientLinkSent'));
    } catch (error: Error | unknown) {
      toast.dismiss();
      
      // Handle domain verification error specifically
      if (error instanceof Error && error.message.includes('Domain verification required')) {
        toast.error(t('emailDomainVerificationRequired'));
      } else {
        toast.error(t('clientLinkSendFailed'));
      }
      
      // Error sending client link handled by UI
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(project.slug);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(project.id);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewClick(project.slug);
  };

  const handleCardClick = () => {
    onViewClick(project.slug);
  };

  return {
    handleCopyClientLink,
    handleViewClientPage,
    handleSendClientLink,
    handleEditClick,
    handleDeleteClick,
    handleViewClick,
    handleCardClick
  };
};
