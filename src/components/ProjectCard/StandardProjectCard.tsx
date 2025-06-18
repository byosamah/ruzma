
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
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
      onClick={actions.handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2">
            {project.name}
          </CardTitle>
          <ProjectCardActions
            onEditClick={actions.handleEditClick}
            onViewClick={actions.handleViewClick}
            onDeleteClick={onDeleteClick ? actions.handleDeleteClick : undefined}
            onCopyClientLink={actions.handleCopyClientLink}
            onViewClientPage={actions.handleViewClientPage}
            variant="header"
          />
        </div>
      </CardHeader>
      <CardContent>
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
          showClientActions={true}
          variant="footer"
        />
      </CardContent>
    </Card>
  );
};

export default StandardProjectCard;
