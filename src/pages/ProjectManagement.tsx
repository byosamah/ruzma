
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useT, TranslationKey } from "@/lib/i18n";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useProjects } from "@/hooks/useProjects";
import ProjectHeader from "@/components/ProjectManagement/ProjectHeader";
import MilestoneList from "@/components/ProjectManagement/MilestoneList";
import { useIsMobile } from "@/hooks/use-mobile";

const ProjectManagement: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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
    downloadDeliverable,
    updateMilestoneWatermark,
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return <div>{t('loading')}</div>;
  
  if (!project) {
    return (
      <Layout user={profile || user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="max-w-md mx-auto text-center px-6">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('projectNotFound')}</h2>
            <p className="text-gray-600 mb-6">{t('projectNotFoundDesc')}</p>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {t('goToDashboard')}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user}>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to projects
            </Button>
          </div>
        </div>

        {/* Project Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <ProjectHeader 
              project={project} 
              onBackClick={handleBackClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              userCurrency={userCurrency.currency}
            />
          </div>
        </div>

        {/* Milestones Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('projectMilestones')}</h2>
                <p className="text-gray-600 mt-1">{t('trackProgressAndDeliverables')}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{t('totalMilestones')}</div>
                <div className="text-2xl font-bold text-gray-900">{project.milestones.length}</div>
              </div>
            </div>
            
            <MilestoneList
              milestones={project.milestones}
              userCurrency={userCurrency.currency}
              onUpdateMilestoneStatus={updateMilestoneStatus}
              onPaymentUpload={uploadPaymentProof}
              onDeliverableUpload={uploadDeliverable}
              onDeliverableDownload={downloadDeliverable}
              onUpdateWatermark={updateMilestoneWatermark}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
