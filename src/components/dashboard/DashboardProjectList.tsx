
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Calendar, DollarSign, FileText, Edit, Trash2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';

interface DashboardProjectListProps {
  projects: DatabaseProject[];
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onNewProject: () => void;
  currency: string;
  canCreateProject: boolean;
}

const DashboardProjectList: React.FC<DashboardProjectListProps> = ({
  projects,
  onEdit,
  onDelete,
  onNewProject,
  currency,
  canCreateProject,
}) => {
  const t = useT();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_submitted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const EmptyProjectsButton = () => {
    const button = (
      <Button 
        onClick={onNewProject} 
        size="lg" 
        className="mt-4"
        disabled={!canCreateProject}
      >
        <Plus className="w-5 h-5 mr-2" />
        {t('createFirstProject')}
      </Button>
    );

    if (!canCreateProject) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Project limit reached. Upgrade your plan to create more projects.</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('recentProjects')}</span>
          {projects.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNewProject}
                  disabled={!canCreateProject}
                  className={!canCreateProject ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('newProject')}
                </Button>
              </TooltipTrigger>
              {!canCreateProject && (
                <TooltipContent>
                  <p>Project limit reached. Upgrade your plan to create more projects.</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              {t('noProjectsYet')}
            </h3>
            <p className="text-slate-400 mb-4">{t('createFirstProjectDesc')}</p>
            <EmptyProjectsButton />
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => {
              const totalMilestones = project.milestones.length;
              const completedMilestones = project.milestones.filter(
                (m) => m.status === 'approved'
              ).length;
              const totalValue = project.milestones.reduce(
                (sum, m) => sum + Number(m.price),
                0
              );

              return (
                <div
                  key={project.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800 mb-1">
                        {project.name}
                      </h4>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {project.brief}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {completedMilestones}/{totalMilestones} {t('completed')}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {totalValue.toFixed(2)} {currency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge
                        className={getStatusColor(
                          project.milestones[0]?.status || 'pending'
                        )}
                      >
                        {project.milestones[0]?.status || 'pending'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(project.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(project.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardProjectList;
