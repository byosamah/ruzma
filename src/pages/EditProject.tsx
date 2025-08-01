
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useProjectManager } from '@/hooks/useProjectManager';
import { useUserProjects } from '@/hooks/projects/useUserProjects';
import { useAuth } from '@/hooks/core/useAuth';
import { useT } from '@/lib/i18n';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import ContractStatusCard from '@/components/CreateProject/ContractStatusCard';
import EditProjectDetailsForm from '@/components/EditProject/EditProjectDetailsForm';
import EditPaymentProofSettings from '@/components/EditProject/EditPaymentProofSettings';
import EditMilestonesList from '@/components/EditProject/EditMilestonesList';
import EditFormActions from '@/components/EditProject/EditFormActions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EditProject: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { navigate } = useLanguageNavigation();
  const t = useT();
  const { user, loading: authLoading } = useAuth();
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
      
      toast.success('Contract resent successfully');
    } catch (error) {
      console.error('Error resending contract:', error);
      toast.error('Failed to resend contract');
    } finally {
      setIsResendingContract(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-slate-600 mb-4">{t('projectNotFoundAccessDenied')}</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-blue-600 hover:text-blue-800"
            >
              {t('returnToDashboard')}
            </button>
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectName')}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectBrief')}
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...form.register('brief')}
                />
                {form.formState.errors.brief && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.brief.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('clientEmail')}
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...form.register('clientEmail')}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? t('saving') : t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProject;
