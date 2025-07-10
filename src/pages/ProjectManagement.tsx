
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, CheckCircle2 } from "lucide-react";
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return <div>{t('loading')}</div>;

  if (!project) {
    return (
      <Layout user={profile || user}>
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
    <Layout user={profile || user}>
      <div className="max-w-5xl mx-auto space-y-8">
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
              <<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">   <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /> </svg> className="w-5 h-5 text-gray-400" />
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
              <DollarSign className="w-5 h-5 text-gray-400" />
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
