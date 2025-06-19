
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
  const { id } = useParams<{ id: string }>();
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
  } = useProjectManagement(id);

  const { deleteProject } = useProjects(user);

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const handleEditClick = () => {
    navigate(`/edit-project/${id}`);
  };

  const handleDeleteClick = async () => {
    if (!id) return;
    
    if (confirm(t('areYouSureDeleteProject'))) {
      const success = await deleteProject(id);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-brand-yellow/60 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-brand-black/70 font-medium">{t('loadingProject')}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return <div>{t('loading')}</div>;
  
  if (!project) {
    return (
      <Layout user={profile || user}>
        <div className="min-h-screen bg-gradient-to-br from-auth-background via-brand-yellow/5 to-brand-blue/5">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-blue/10 to-brand-navy/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-brand-blue/40 rounded-lg"></div>
              </div>
              <h2 className="text-2xl font-bold text-brand-black mb-3">{t('projectNotFound')}</h2>
              <p className="text-brand-black/60 mb-6">{t('projectNotFoundDesc')}</p>
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-brand-blue to-brand-navy hover:from-brand-blue/90 hover:to-brand-navy/90 text-white px-6 py-2"
              >
                {t('goToDashboard')}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user}>
      <div className="min-h-screen bg-gradient-to-br from-auth-background via-brand-yellow/5 to-brand-blue/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-brand-black/60 hover:text-brand-black hover:bg-white/60 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToDashboard')}
            </Button>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Project Header Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-brand-blue/5 overflow-hidden">
              <div className="bg-gradient-to-r from-brand-blue/5 via-brand-yellow/5 to-brand-navy/5 p-6 sm:p-8">
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
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-brand-blue/5 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-black">{t('projectMilestones')}</h2>
                    <p className="text-brand-black/60 mt-1">{t('trackProgressAndDeliverables')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-brand-black/50">{t('totalMilestones')}</div>
                    <div className="text-2xl font-bold text-brand-black">{project.milestones.length}</div>
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
        </div>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
