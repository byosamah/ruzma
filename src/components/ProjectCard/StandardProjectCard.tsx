
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCardProps } from './types';
import { calculateProjectStats } from './utils';
import { useProjectCardActions } from './useProjectCardActions';
import ProjectCardActions from './ProjectCardActions';
import ProjectCardContent from './ProjectCardContent';

const StandardProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewClick,
  onEditClick,
  onDeleteClick,
  currency
}) => {
  const stats = calculateProjectStats(project);
  const actions = useProjectCardActions(project, onViewClick, onEditClick, onDeleteClick);

  return (
    <Card 
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer border-slate-200" 
      onClick={actions.handleCardClick}
    >
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold text-slate-800 line-clamp-2 leading-tight">
            {project.name}
          </CardTitle>
          <ProjectCardActions
            onEditClick={actions.handleEditClick}
            onViewClick={actions.handleViewClick}
            onDeleteClick={onDeleteClick ? actions.handleDeleteClick : undefined}
            onCopyClientLink={actions.handleCopyClientLink}
            onViewClientPage={actions.handleViewClientPage}
            onSendClientLink={actions.handleSendClientLink}
            variant="header"
          />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <ProjectCardContent
          project={project}
          stats={stats}
          currency={currency}
          isVerticalLayout={false}
        />
        
        <ProjectCardActions
          onEditClick={actions.handleEditClick}
          onViewClick={actions.handleViewClick}
          onDeleteClick={onDeleteClick ? actions.handleDeleteClick : undefined}
          onCopyClientLink={actions.handleCopyClientLink}
          onViewClientPage={actions.handleViewClientPage}
          onSendClientLink={actions.handleSendClientLink}
          showClientActions={true}
          variant="footer"
        />
      </CardContent>
    </Card>
  );
};

export default StandardProjectCard;
