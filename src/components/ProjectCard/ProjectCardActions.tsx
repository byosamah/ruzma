
import React from 'react';
import ProjectCardActionsHeader from './ProjectCardActionsHeader';
import ProjectCardActionsFooter from './ProjectCardActionsFooter';

interface ProjectCardActionsProps {
  onEditClick: (e: React.MouseEvent) => void;
  onViewClick: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
  onCopyClientLink: (e: React.MouseEvent) => void;
  onViewClientPage: (e: React.MouseEvent) => void;
  onSendClientLink?: (e: React.MouseEvent) => void;
  showClientActions?: boolean;
  variant?: 'header' | 'footer';
}

const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  onEditClick,
  onViewClick,
  onDeleteClick,
  onCopyClientLink,
  onViewClientPage,
  onSendClientLink,
  showClientActions = false,
  variant = 'header'
}) => {
  if (variant === 'header') {
    return (
      <ProjectCardActionsHeader
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
      />
    );
  }

  return (
    <ProjectCardActionsFooter
      onCopyClientLink={onCopyClientLink}
      onViewClientPage={onViewClientPage}
      onSendClientLink={onSendClientLink}
      showClientActions={showClientActions}
    />
  );
};

export default ProjectCardActions;
