
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink, Send, MoreVertical, Users, Calendar, DollarSign } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { DatabaseProject } from '@/hooks/projectTypes';
import { toast } from 'sonner';
import { sendClientLink } from '@/services/clientLinkService';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectHeaderProps {
  project: DatabaseProject;
  onBackClick: () => void;
  onEditClick: () => void;
  onDeleteClick?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onBackClick,
  onEditClick,
  onDeleteClick
}) => {
  const t = useT();
  const isMobile = useIsMobile();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleCopyClientLink = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    navigator.clipboard.writeText(clientUrl);
    toast.success('Client link copied to clipboard');
    setIsActionsOpen(false);
  };

  const handleViewClientPage = () => {
    const clientUrl = `${window.location.origin}/client/project/${project.client_access_token}`;
    window.open(clientUrl, '_blank');
    setIsActionsOpen(false);
  };

  const handleSendClientLink = async () => {
    if (!project.client_email) {
      toast.error('No client email address found for this project');
      return;
    }

    try {
      toast.loading('Sending client link...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      await sendClientLink({
        clientEmail: project.client_email,
        projectName: project.name,
        freelancerName: 'Your freelancer',
        clientToken: project.client_access_token,
        userId: user?.id,
      });

      toast.dismiss();
      toast.success('Client link sent successfully!');
      setIsActionsOpen(false);
    } catch (error: any) {
      toast.dismiss();
      
      if (error.message && error.message.includes('Domain verification required')) {
        toast.error('Email domain needs verification. Please contact support.');
      } else {
        toast.error('Failed to send client link. Please try again.');
      }
      
      console.error('Error sending client link:', error);
    }
  };

  const handleEdit = () => {
    onEditClick();
    setIsActionsOpen(false);
  };

  const handleDelete = () => {
    if (onDeleteClick) {
      onDeleteClick();
    }
    setIsActionsOpen(false);
  };

  // Calculate project stats
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;

  if (isMobile) {
    return (
      <div className="space-y-6">
        {/* Project Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight break-words">{project.name}</h1>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">{project.brief}</p>
          </div>
          <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="ml-3 flex-shrink-0 bg-white/80 border-slate-200">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm">
              <DropdownMenuItem onClick={handleCopyClientLink} className="flex items-center">
                <Copy className="w-4 h-4 mr-3 text-slate-600" />
                <span>Copy Client Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendClientLink} className="flex items-center">
                <Send className="w-4 h-4 mr-3 text-slate-600" />
                <span>Send Client Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewClientPage} className="flex items-center">
                <ExternalLink className="w-4 h-4 mr-3 text-slate-600" />
                <span>View Client Page</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit} className="flex items-center">
                <Edit className="w-4 h-4 mr-3 text-slate-600" />
                <span>Edit Project</span>
              </DropdownMenuItem>
              {onDeleteClick && (
                <DropdownMenuItem onClick={handleDelete} className="flex items-center text-red-600">
                  <Trash2 className="w-4 h-4 mr-3" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-xl p-4 text-center border border-white/40">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-slate-800">{formatCurrency(totalValue, 'USD')}</div>
            <div className="text-xs text-slate-600">Total Value</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4 text-center border border-white/40">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-slate-800">{completedMilestones}/{totalMilestones}</div>
            <div className="text-xs text-slate-600">Progress</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4 text-center border border-white/40">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-slate-800">{totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%</div>
            <div className="text-xs text-slate-600">Complete</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-md"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{project.name}</h1>
              <p className="text-slate-600 mt-1">{project.brief}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCopyClientLink}
            className="bg-white/80 border-slate-200 hover:bg-white text-slate-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            onClick={handleSendClientLink}
            className="bg-white/80 border-slate-200 hover:bg-white text-slate-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Link
          </Button>
          <Button
            variant="outline"
            onClick={handleViewClientPage}
            className="bg-white/80 border-slate-200 hover:bg-white text-slate-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={onEditClick}
            className="bg-white/80 border-slate-200 hover:bg-white text-slate-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {onDeleteClick && (
            <Button
              variant="outline"
              onClick={onDeleteClick}
              className="bg-white/80 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 rounded-xl p-6 border border-white/40">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalValue, 'USD')}</div>
              <div className="text-sm text-slate-600">Total Project Value</div>
            </div>
          </div>
        </div>
        <div className="bg-white/60 rounded-xl p-6 border border-white/40">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{totalMilestones}</div>
              <div className="text-sm text-slate-600">Total Milestones</div>
            </div>
          </div>
        </div>
        <div className="bg-white/60 rounded-xl p-6 border border-white/40">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{completedMilestones}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white/60 rounded-xl p-6 border border-white/40">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">%</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%</div>
              <div className="text-sm text-slate-600">Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/60 rounded-xl p-4 border border-white/40">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Project Progress</span>
          <span className="text-sm text-slate-600">{completedMilestones} of {totalMilestones} milestones completed</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
