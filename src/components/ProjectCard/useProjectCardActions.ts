
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';
import { supabase } from '@/integrations/supabase/client';

export const useProjectCardActions = (
  project: any,
  onViewClick: (slug: string) => void,
  onEditClick: (slug: string) => void,
  onDeleteClick?: (id: string) => void
) => {
  const handleCopyClientLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use the full client_access_token directly
    const clientUrl = `https://hub.ruzma.co/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success('Client link copied to clipboard');
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
        freelancerName: 'Your freelancer', // fallback name
        clientToken: project.client_access_token, // Use full token directly
        userId: user?.id,
      });

      toast.dismiss();
      toast.success('Client link sent successfully!');
    } catch (error: any) {
      toast.dismiss();
      
      // Handle domain verification error specifically
      if (error.message && error.message.includes('Domain verification required')) {
        toast.error('Email domain needs verification. Please contact support.');
      } else {
        toast.error('Failed to send client link. Please try again.');
      }
      
      console.error('Error sending client link:', error);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(project.slug);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete project clicked for ID:', project.id); // Debug log
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
