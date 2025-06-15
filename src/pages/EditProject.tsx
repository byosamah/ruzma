
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm } from '@/components/EditProject/ProjectForm';
import { useEditProject } from '@/hooks/useEditProject';
import { useT } from '@/lib/i18n';

const EditProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const t = useT();

  const {
    user,
    profile,
    project,
    name,
    brief,
    milestones,
    loading,
    updating,
    handleSignOut,
    handleMilestoneChange,
    handleAddMilestone,
    handleDeleteMilestone,
    handleSubmit,
    setName,
    setBrief,
  } = useEditProject(projectId);


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

  if (!user || !project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-600">{t('projectNotFoundAccessDenied')}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            {t('returnToDashboard')}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user} onSignOut={handleSignOut}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 flex items-center"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('backToDashboard')}
      </Button>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t('editProject')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm
              name={name}
              brief={brief}
              milestones={milestones}
              updating={updating}
              onNameChange={setName}
              onBriefChange={setBrief}
              onMilestoneChange={handleMilestoneChange}
              onAddMilestone={handleAddMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProject;
