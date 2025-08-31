
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coins } from "lucide-react";
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { useProjects } from "@/hooks/useProjects";
import ProjectHeader from "@/components/ProjectManagement/ProjectHeader";
import MilestoneList from "@/components/ProjectManagement/MilestoneList";
import EditContractDialog from "@/components/CreateProject/EditContractDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProjectManagement: React.FC = () => {
  // Add error boundary for Router context
  let slug: string | undefined;
  let navigate: (path: string) => void;
  
  try {
    const params = useParams<{ slug: string; }>();
    slug = params.slug;
    navigate = useNavigate();
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  const { language } = useLanguage();
  const t = useT();
  const {
    user,
    profile,
    project,
    loading,
    userCurrency,
    updateMilestoneStatus,
    uploadPaymentProof,
    updateDeliverableLink,
    updateMilestoneStatusGeneric,
    updateRevisionData,
    addRevisionRequestClient,
  } = useProjectManagement(slug);
  const { deleteProject } = useProjects(user);
  const [isResendingContract, setIsResendingContract] = useState(false);
  const [isEditContractDialogOpen, setIsEditContractDialogOpen] = useState(false);

  const handleBackClick = () => {
    navigate("/projects");
  };

  const handleEditClick = () => {
    if (project?.slug) {
      navigate(`/edit-project/${project.slug}`);
    }
  };

  const handleDeleteClick = async () => {
    if (!project?.id) return;
    if (confirm(t('areYouSureDeleteProject'))) {
      const success = await deleteProject(project.id);
      if (success) {
        navigate('/projects');
      }
    }
  };

  const handleResendContract = async () => {
    if (!project?.id) return;
    
    setIsResendingContract(true);
    try {
      const { error } = await supabase.functions.invoke('resend-contract', {
        body: { projectId: project.id }
      });

      if (error) throw error;
      
      toast.success(t('contractResentSuccessfully'));
    } catch (error) {
      toast.error(t('failedToResendContract'));
    } finally {
      setIsResendingContract(false);
    }
  };

  const handleEditContract = () => {
    setIsEditContractDialogOpen(true);
  };

  const handleContractUpdated = () => {
    // Trigger a re-fetch of project data or handle state updates as needed
    window.location.reload(); // Simple solution for now
  };

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return <div>{t('loading')}</div>;

  if (!project) {
    return (
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="text-4xl">📁</div>
            <h2 className="text-lg font-medium text-gray-900">{t('projectNotFound')}</h2>
            <p className="text-gray-500 text-sm">{t('projectNotFoundDesc')}</p>
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="outline"
              size="sm"
            >
              {t('goToDashboard')}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedValue = project.milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.price, 0);

  return (
    <Layout user={user}>
      <div className="max-w-5xl mx-auto space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Project Header */}
        <div className="space-y-6">
          <ProjectHeader 
            project={project} 
            onBackClick={handleBackClick} 
            onEditClick={handleEditClick} 
            onDeleteClick={handleDeleteClick} 
            userCurrency={userCurrency.currency}
            onResendContract={handleResendContract}
            onEditContract={handleEditContract}
            isResendingContract={isResendingContract}
          />
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50/50 rounded-lg p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('progress')}</p>
                <p className="text-xl font-medium text-gray-900">
                  {completedMilestones}/{project.milestones.length}
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-lg p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('totalValue')}</p>
                <p className="text-xl font-medium text-gray-900">
                  {userCurrency.formatCurrency(totalValue)}
                </p>
              </div>
              <Coins className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-lg p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('completed')}</p>
                <p className="text-xl font-medium text-gray-900">
                  {userCurrency.formatCurrency(completedValue)}
                </p>
              </div>
              <Coins className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900">{t('milestones')}</h2>
            <span className="text-sm text-gray-500">
              {project.milestones.length} {project.milestones.length === 1 ? t('milestone') : t('milestones')}
            </span>
          </div>
          
          <MilestoneList 
            milestones={project.milestones} 
            userCurrency={userCurrency.currency}
            onUpdateMilestoneStatus={updateMilestoneStatus} 
            onPaymentUpload={uploadPaymentProof}
            onDeliverableLinkUpdate={updateDeliverableLink}
            onStatusChange={updateMilestoneStatusGeneric}
            onRevisionUpdate={updateRevisionData}
          />
        </div>

        {/* Edit Contract Dialog */}
        {project && (
          <EditContractDialog
            isOpen={isEditContractDialogOpen}
            onClose={() => setIsEditContractDialogOpen(false)}
            project={project}
            onContractUpdated={handleContractUpdated}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProjectManagement;
