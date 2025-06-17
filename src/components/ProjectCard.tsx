import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, CheckCircle, Clock, Eye, Edit, Link, Copy } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
interface ProjectCardProps {
  project: DatabaseProject;
  onViewClick: (projectId: string) => void;
  onEditClick: (projectId: string) => void;
  currency: CurrencyCode;
}
const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewClick,
  onEditClick,
  currency
}) => {
  const t = useT();
  const totalValue = project.milestones.reduce((sum, milestone) => sum + milestone.price, 0);
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'payment_submitted':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  const handleCopyClientLink = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success('Client link copied to clipboard');
  };
  const handleViewClientPage = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    window.open(clientUrl, '_blank');
  };

  // Safe date formatting with better error handling
  const formatProjectDate = (dateString: string) => {
    if (!dateString) return 'No Date';
    try {
      // Try direct parsing first
      let date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy');
      }

      // Try ISO parsing
      date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy');
      }
      return 'Invalid Date';
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Invalid Date';
    }
  };
  return <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2">
            {project.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEditClick(project.id)} className="flex items-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewClick(project.id)} className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300">
              <Eye className="w-4 h-4" />
              View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm line-clamp-3">{project.brief}</p>
        
        <div className="grid grid-cols-2 gap-20 mx-px">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">{formatCurrency(totalValue, currency)}</span>
          </div>
          <div className="flex items-center gap-2 mx-0">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-slate-600">
              {formatProjectDate(project.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">
              {completedMilestones}/{totalMilestones} Milestones
            </span>
          </div>
          <div className="text-sm text-slate-500 px-[21px]">
            {totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0}% Complete
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.milestones.slice(0, 3).map(milestone => <Badge key={milestone.id} variant="secondary" className={`text-xs ${getStatusColor(milestone.status)} text-white`}>
              {milestone.title}
            </Badge>)}
          {project.milestones.length > 3 && <Badge variant="outline" className="text-xs">
              +{project.milestones.length - 3} More
            </Badge>}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={handleCopyClientLink} className="flex items-center gap-1 flex-1">
            <Copy className="w-4 h-4" />
            Copy Client Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewClientPage} className="flex items-center gap-1 flex-1">
            <Link className="w-4 h-4" />
            View Client Page
          </Button>
        </div>
      </CardContent>
    </Card>;
};
export default ProjectCard;