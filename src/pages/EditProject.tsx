
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useProjectManager } from '@/hooks/useProjectManager';
import { useUserProjects } from '@/hooks/projects/useUserProjects';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useT } from '@/lib/i18n';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/profile';
import ContractStatusCard from '@/components/CreateProject/ContractStatusCard';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import PaymentProofSettings from '@/components/CreateProject/PaymentProofSettings';
import MilestonesList from '@/components/CreateProject/MilestonesList';
import FormActions from '@/components/CreateProject/FormActions';
import { ContractTermsSection } from '@/components/CreateProject/ContractTermsSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function EditProject() {
  const { slug } = useParams<{ slug: string }>();
  const { navigate } = useLanguageNavigation();
  const t = useT();
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useProfileQuery(user);
  const { projects, loading: projectsLoading } = useUserProjects(user);
  const [isResendingContract, setIsResendingContract] = useState(false);

  // Find the project
  const project = projects.find(p => p.slug === slug || p.id === slug);
  
  const {
    form,
    handleSubmit,
    isSubmitting,
    addMilestone,
    removeMilestone,
  } = useProjectManager({ 
    mode: 'edit', 
    user, 
    existingProject: project 
  });

  const loading = authLoading || projectsLoading;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleResendContract = async () => {
    if (!project?.id) return;
    
    setIsResendingContract(true);
    try {
      const { error } = await supabase.functions.invoke('resend-contract', {
        body: { projectId: project.id }
      });

      if (error) throw error;
      
      toast.success(t('contractResentSuccess'));
    } catch (error) {
      toast.error(t('contractResendFailed'));
    } finally {
      setIsResendingContract(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Layout user={user}>
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
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-slate-600 mb-4">{t('projectNotFoundAccessDenied')}</p>
            <Button
              variant="link"
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 p-0 h-auto"
            >
              {t('returnToDashboard')}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="min-h-screen bg-gray-50/30">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {t('editProject')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('setupProjectMilestones')}
            </p>
          </div>

          {/* Contract Status */}
          {project?.contract_status && (
            <ContractStatusCard
              contractStatus={project.contract_status as 'pending' | 'approved' | 'rejected'}
              contractSentAt={project.contract_sent_at}
              contractApprovedAt={project.contract_approved_at}
              rejectionReason={project.contract_rejection_reason}
              onResendContract={handleResendContract}
              onEditContract={() => {}} // Will be implemented if needed
              isResending={isResendingContract}
              contractTerms={project.contract_terms}
              paymentTerms={project.payment_terms}
              projectScope={project.project_scope}
              revisionPolicy={project.revision_policy}
            />
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <ProjectDetailsForm user={user} />
              <PaymentProofSettings />
              <MilestonesList user={user} profile={profile as UserProfile} />
              <ContractTermsSection form={form} />
              <FormActions isSubmitting={isSubmitting} onCancel={handleCancel} />
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProject;
