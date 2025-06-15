
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useT, TranslationKey } from "@/lib/i18n";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import ProjectHeader from "@/components/ProjectManagement/ProjectHeader";
import MilestoneList from "@/components/ProjectManagement/MilestoneList";

const ProjectManagement: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const t = useT();

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
  } = useProjectManagement(projectId);


  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">{t('loadingProject')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return <div>{t('loading')}</div>;
  
  if (!project) {
    return (
      <Layout user={profile || user}>
        <div className="max-w-xl mx-auto text-center mt-20">
          <h2 className="text-2xl font-bold mb-2">{t('projectNotFound')}</h2>
          <Button onClick={() => navigate("/dashboard")}>{t('goToDashboard')}</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 flex items-center"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('backToDashboard')}
      </Button>
      <div className="max-w-2xl mx-auto space-y-8">
        <ProjectHeader project={project} />
        <MilestoneList
          milestones={project.milestones}
          userCurrency={userCurrency}
          onUpdateMilestoneStatus={updateMilestoneStatus}
          onPaymentUpload={uploadPaymentProof}
          onDeliverableUpload={uploadDeliverable}
          onDeliverableDownload={downloadDeliverable}
          onUpdateWatermark={updateMilestoneWatermark}
        />
      </div>
    </Layout>
  );
};

export default ProjectManagement;
