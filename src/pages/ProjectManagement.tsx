
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import { useT, TranslationKey } from "@/lib/i18n";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useProjects } from "@/hooks/useProjects";
import ProjectHeader from "@/components/ProjectManagement/ProjectHeader";
import MilestoneList from "@/components/ProjectManagement/MilestoneList";
import { useIsMobile } from "@/hooks/use-mobile";

const ProjectManagement: React.FC = () => {
  const { slug } = useParams<{ slug: string; }>();
  const navigate = useNavigate();
  const t = useT();
  const isMobile = useIsMobile();
  const {
    user,
    profile,
    project,
    loading,
    userCurrency,
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    updateDeliverableLink,
    downloadDeliverable
  } = useProjectManagement(slug);
  const { deleteProject } = useProjects(user);

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return <div>{t('loading')}</div>;

  if (!project) {
    return (
      <Layout user={profile || user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">{t('projectNotFound')}</h2>
            <p className="text-gray-500 mb-6">{t('projectNotFoundDesc')}</p>
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="outline"
              className="text-sm"
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
    <Layout user={profile || user}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Navigation */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="text-gray-500 hover:text-gray-700 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('backToProjects')}
          </Button>
        </div>

        {/* Project Header */}
        <div className="space-y-6">
          <ProjectHeader 
            project={project} 
            onBackClick={handleBackClick} 
            onEditClick={handleEditClick} 
            onDeleteClick={handleDeleteClick} 
            userCurrency={userCurrency.currency} 
          />
        </div>

        {/* Project Stats - Minimal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-lg font-medium text-gray-900">
                  {completedMilestones}/{project.milestones.length}
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-lg font-medium text-gray-900">
                  {userCurrency.formatCurrency(totalValue)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-lg font-medium text-gray-900">
                  {userCurrency.formatCurrency(completedValue)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Milestones Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900">{t('projectMilestones')}</h2>
            <span className="text-sm text-gray-500">{project.milestones.length} {project.milestones.length === 1 ? 'milestone' : 'milestones'}</span>
          </div>
          
          <MilestoneList 
            milestones={project.milestones} 
            userCurrency={userCurrency.currency}
            userType={profile?.user_type as 'free' | 'plus' | 'pro' || 'free'}
            onUpdateMilestoneStatus={updateMilestoneStatus} 
            onPaymentUpload={uploadPaymentProof} 
            onDeliverableUpload={uploadDeliverable}
            onDeliverableLinkUpdate={updateDeliverableLink}
            onDeliverableDownload={downloadDeliverable} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
