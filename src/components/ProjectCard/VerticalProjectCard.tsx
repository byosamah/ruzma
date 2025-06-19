
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectCardProps } from './types';
import { calculateProjectStats, getStatusColor } from './utils';
import { useProjectCardActions } from './useProjectCardActions';
import ProjectCardActions from './ProjectCardActions';
import ProjectCardContent from './ProjectCardContent';

const VerticalProjectCard: React.FC<ProjectCardProps> = ({
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
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-base font-semibold text-slate-800 line-clamp-2 flex-1">
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
      
      <CardContent className="pt-0 pb-4">
        <ProjectCardContent
          project={project}
          stats={stats}
          currency={currency}
          isVerticalLayout={true}
        />
        
        <div className="mt-4 pt-3 border-t border-slate-100">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default VerticalProjectCard;
