
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
      className="group hover:shadow-sm transition-all duration-200 cursor-pointer border-0 bg-white rounded-lg" 
      onClick={actions.handleCardClick}
    >
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-gray-700 transition-colors">
            {project.name}
          </CardTitle>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <ProjectCardContent
          project={project}
          stats={stats}
          currency={currency}
          isVerticalLayout={false}
        />
        
        <div className="mt-4 pt-3 border-t border-gray-50">
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

export default StandardProjectCard;
