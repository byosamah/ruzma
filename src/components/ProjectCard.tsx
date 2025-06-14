
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  deliverable?: File;
  paymentProof?: File;
}

export interface Project {
  id: string;
  name: string;
  brief: string;
  milestones: Milestone[];
  createdAt: string;
  clientUrl: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const pendingPayments = project.milestones.filter(m => m.status === 'payment_submitted').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'payment_submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'payment_submitted': return <Clock className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    if (e.target instanceof HTMLElement) {
      const isInteractiveElement = e.target.closest('button, a, [role="button"]');
      if (!isInteractiveElement) {
        navigate(`/project/${project.id}`);
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(project);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 bg-white/80 backdrop-blur-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800">{project.name}</CardTitle>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.brief}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleEditClick}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteClick} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Progress</span>
            <span className="text-sm font-medium">{completedMilestones}/{totalMilestones} completed</span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
            ></div>
          </div>

          {pendingPayments > 0 && (
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-100 text-orange-800">
                {pendingPayments} payment{pendingPayments > 1 ? 's' : ''} pending review
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Recent Milestones:</p>
            {project.milestones.slice(0, 3).map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-600 truncate">{milestone.title}</span>
                <Badge className={`text-xs flex items-center space-x-1 ${getStatusColor(milestone.status)}`}>
                  {getStatusIcon(milestone.status)}
                  <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button 
              asChild 
              size="sm" 
              className="flex-1"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Link to={`/project/${project.id}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Project
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <a href={project.clientUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Client Page
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
