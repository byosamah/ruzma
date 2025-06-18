
import { toast } from 'sonner';

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
    handleEditClick,
    handleDeleteClick,
    handleViewClick,
    handleCardClick
  };
};
