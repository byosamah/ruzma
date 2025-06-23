import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm } from '@/components/EditProject/ProjectForm';
import { useEditProject } from '@/hooks/useEditProject';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
const EditProject: React.FC = () => {
  const {
    id: projectId
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const t = useT();
  const isMobile = useIsMobile();
  const {
    user,
    profile,
    project,
    name,
    brief,
    clientEmail,
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
    setClientEmail
  } = useEditProject(projectId);
  if (loading) {
    return <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">{t('loadingProject')}</p>
          </div>
        </div>
      </Layout>;
  }
  if (!user || !project) {
    return <Layout>
        <div className="text-center py-12">
          <p className="text-slate-600">{t('projectNotFoundAccessDenied')}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            {t('returnToDashboard')}
          </Button>
        </div>
      </Layout>;
  }
  return <Layout user={profile || user} onSignOut={handleSignOut}>
      
      <div className={`${isMobile ? 'max-w-full' : 'max-w-2xl'} mx-auto`}>
        <Card>
          <CardHeader>
            <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>{t('editProject')}</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'px-4' : ''}>
            <ProjectForm name={name} brief={brief} clientEmail={clientEmail} milestones={milestones} updating={updating} onNameChange={setName} onBriefChange={setBrief} onClientEmailChange={setClientEmail} onMilestoneChange={handleMilestoneChange} onAddMilestone={handleAddMilestone} onDeleteMilestone={handleDeleteMilestone} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </Layout>;
};
export default EditProject;