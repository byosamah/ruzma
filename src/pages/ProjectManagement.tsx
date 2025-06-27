
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
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
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
  const {
    deleteProject
  } = useProjects(user);
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
    return <Layout>
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-slate-900"></div>
        </div>
      </Layout>;
  }
  if (!user) return <div>{t('loading')}</div>;
  if (!project) {
    return <Layout user={profile || user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center pt-12 pb-8">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
              </div>
              <CardTitle className="text-2xl mb-3">{t('projectNotFound')}</CardTitle>
              <p className="text-gray-600 mb-6">{t('projectNotFoundDesc')}</p>
              <Button onClick={() => navigate("/dashboard")} className="bg-gray-900 hover:bg-gray-800 text-white">
                {t('goToDashboard')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>;
  }
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedValue = project.milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.price, 0);
  return (
    <Layout user={profile || user}>
      <div className={`space-y-6 ${isMobile ? 'px-2' : 'sm:space-y-8'}`}>
        {/* Project Overview Card */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <ProjectHeader 
              project={project} 
              onBackClick={handleBackClick} 
              onEditClick={handleEditClick} 
              onDeleteClick={handleDeleteClick} 
              userCurrency={userCurrency.currency} 
            />
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <section aria-label="Project statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Progress</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {completedMilestones}/{project.milestones.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {userCurrency.formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Completed Value</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {userCurrency.formatCurrency(completedValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Milestones Section */}
        <main>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">{t('projectMilestones')}</CardTitle>
                  <p className="text-slate-600 mt-1 text-sm sm:text-base">{t('trackProgressAndDeliverables')}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">{t('totalMilestones')}</div>
                  <div className="text-2xl font-bold text-slate-800">{project.milestones.length}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </main>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
