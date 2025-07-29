
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm } from '@/components/EditProject/ProjectForm';
import { useEditProject } from '@/hooks/useEditProject';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import ContractStatusCard from '@/components/CreateProject/ContractStatusCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EditProject: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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
    paymentProofRequired,
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
    setClientEmail,
    setPaymentProofRequired,
  } = useEditProject(slug);
  const [isResendingContract, setIsResendingContract] = useState(false);

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
      <div className={`${isMobile ? 'max-w-full' : 'max-w-2xl'} mx-auto`}>
        <Card>
          <CardHeader>
            <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>{t('editProject')}</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'px-4' : ''}>
            {/* Contract Status */}
            {project.contract_status && project.contract_status !== 'approved' && (
              <div className="mb-6">
                <ContractStatusCard
                  contractStatus={project.contract_status as 'pending' | 'approved' | 'rejected'}
                  contractSentAt={project.contract_sent_at}
                  contractApprovedAt={project.contract_approved_at}
                  rejectionReason={project.contract_rejection_reason}
                  onResendContract={handleResendContract}
                  isResending={isResendingContract}
                />
              </div>
            )}
            
            <ProjectForm
              name={name}
              brief={brief}
              clientEmail={clientEmail}
              paymentProofRequired={paymentProofRequired}
              milestones={milestones}
              updating={updating}
              onNameChange={setName}
              onBriefChange={setBrief}
              onClientEmailChange={setClientEmail}
              onPaymentProofRequiredChange={setPaymentProofRequired}
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
