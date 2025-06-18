
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';

export const useProjectCardActions = (
  project: any,
  onViewClick: (id: string) => void,
  onEditClick: (id: string) => void,
  onDeleteClick?: (id: string) => void
) => {
  const handleCopyClientLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success('Client link copied to clipboard');
  };

  const handleViewClientPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
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
      
      // Get freelancer name from user profile or use default
      const freelancerName = 'Your freelancer'; // This should ideally come from user profile
      
      await sendClientLink({
        clientEmail: project.client_email,
        projectName: project.name,
        freelancerName,
        clientToken: project.client_access_token,
      });

      toast.dismiss();
      toast.success('Client link sent successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to send client link. Please try again.');
      console.error('Error sending client link:', error);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(project.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(project.id);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewClick(project.id);
  };

  const handleCardClick = () => {
    onViewClick(project.id);
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
