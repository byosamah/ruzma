
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, ArrowLeft, Link, Copy, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';

interface ProjectHeaderProps {
  project: DatabaseProject;
  onBackClick: () => void;
  onEditClick: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBackClick, onEditClick }) => {
  const t = useT();

  const totalValue = project.milestones.reduce((sum, milestone) => sum + milestone.price, 0);
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const pendingPayments = project.milestones.filter(m => m.status === 'payment_submitted').length;

  const handleCopyClientLink = () => {
    // Use client_access_token for the client URL
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success('Client link copied to clipboard');
  };

  const handleViewClientPage = () => {
    // Use client_access_token for the client URL
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    window.open(clientUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={onBackClick}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToDashboard')}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyClientLink}
            className="flex items-center gap-1"
          >
            <Copy className="w-4 h-4" />
            Copy Client Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewClientPage}
            className="flex items-center gap-1"
          >
            <Link className="w-4 h-4" />
            View Client Page
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            {t('editProject')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                {project.name}
              </CardTitle>
              <p className="text-slate-600">{project.brief}</p>
            </div>
            <div className="flex gap-2">
              {pendingPayments > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingPayments} {t('pendingPayments')}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {completedMilestones}/{project.milestones.length} {t('completed')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">{t('totalValue')}</p>
                <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Start Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Client Email</p>
                <p className="text-lg font-semibold">{project.client_email || 'Not Specified'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectHeader;
