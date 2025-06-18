
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
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3">
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
                onSendClientLink={actions.handleSendClientLink}
                variant="header"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ProjectCardContent
              project={project}
              stats={stats}
              currency={currency}
              isVerticalLayout={true}
            />
          </CardContent>
        </div>
        
        <div className="md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-slate-200">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {project.milestones.slice(0, 3).map(milestone => (
                <Badge key={milestone.id} variant="secondary" className={`text-xs ${getStatusColor(milestone.status)} text-white`}>
                  {milestone.title}
                </Badge>
              ))}
              {project.milestones.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.milestones.length - 3} More
                </Badge>
              )}
            </div>

            <ProjectCardActions
              onEditClick={actions.handleEditClick}
              onViewClick={actions.handleViewClick}
              onDeleteClick={onDeleteClick ? actions.handleDeleteClick : undefined}
              onCopyClientLink={actions.handleCopyClientLink}
              onViewClientPage={actions.handleViewClientPage}
              onSendClientLink={actions.handleSendClientLink}
              variant="footer"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VerticalProjectCard;
