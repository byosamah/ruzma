
import React from 'react';
import { useParams } from 'react-router-dom';
import { useClientProject } from '@/hooks/useClientProject';
import { useClientBranding } from '@/hooks/useClientBranding';
import BrandedClientHeader from "@/components/ProjectClient/BrandedClientHeader";
import ClientProjectLoading from "@/components/ProjectClient/ClientProjectLoading";
import ClientProjectError from "@/components/ProjectClient/ClientProjectError";
import ProjectOverviewCard from "@/components/ProjectClient/ProjectOverviewCard";
import ProjectPaymentDeliveryCard from "@/components/ProjectClient/ProjectPaymentDeliveryCard";
import ProjectInstructionsCard from "@/components/ProjectClient/ProjectInstructionsCard";
import ProjectMilestonesList from "@/components/ProjectClient/ProjectMilestonesList";
import ProjectFooter from "@/components/ProjectClient/ProjectFooter";
import ContractApprovalModal from "@/components/ProjectClient/ContractApprovalModal";
import ClientContractStatus from "@/components/ProjectClient/ClientContractStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import { parseClientToken } from "@/lib/clientUrlUtils";
import { CurrencyCode } from "@/lib/currency";

const ClientProject = () => {
  const { token } = useParams<{ token: string }>();
  const isMobile = useIsMobile();
  const [contractRejected, setContractRejected] = React.useState(false);
  
  console.log('ClientProject: token from params:', token);
  console.log('ClientProject: current pathname:', window.location.pathname);
  
  // Parse the token to handle both legacy and hybrid formats
  const parsedToken = token ? parseClientToken(token) : null;
  console.log('ClientProject: parsed token:', parsedToken);
  
  const {
    project,
    isLoading,
    error,
    needsContractApproval,
    handlePaymentUpload,
    handleRevisionRequest,
    userCurrency,
    freelancerCurrency,
    refetchProject,
  } = useClientProject(parsedToken?.token, parsedToken?.isHybrid);

  const {
    branding,
    isLoading: brandingLoading,
  } = useClientBranding(project?.user_id);

  if (isLoading || brandingLoading) {
    return <ClientProjectLoading />;
  }

  if (error || !project || !parsedToken) {
    console.log('ClientProject: error or no project:', { error, project, parsedToken });
    return <ClientProjectError error={error} />;
  }

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);

  // Safely extract currency values with proper type casting
  const userCurrencyCode = userCurrency?.currency || 'USD';
  const freelancerCurrencyCode = (freelancerCurrency as CurrencyCode) || userCurrencyCode;
  
  // Always use freelancer's preferred currency if available, otherwise fall back to user currency
  const displayCurrency = freelancerCurrencyCode || userCurrencyCode;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandedClientHeader branding={branding} />
      
      {/* Show waiting message if contract was rejected */}
      {contractRejected && (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Sent Successfully</h2>
            <p className="text-gray-600 mb-4">
              Your feedback has been sent to the freelancer. Please wait while they review and update the contract based on your comments.
            </p>
            <p className="text-sm text-gray-500">
              You will receive a new email once the updated contract is ready for your review.
            </p>
          </div>
        </div>
      )}
      
      {/* Contract Approval Modal */}
      {needsContractApproval && project && !contractRejected && (
        <ContractApprovalModal
          isOpen={needsContractApproval}
          onClose={() => {}} // Cannot close until approved/rejected
          project={project}
          onApprovalComplete={refetchProject}
          onRejectionComplete={() => setContractRejected(true)}
        />
      )}
      
      {/* Main Content - Only show if contract is approved or doesn't require approval */}
      {!needsContractApproval && !contractRejected && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
          {/* Contract Status - Show for all approved contracts */}
          {project.contract_status && (
            <ClientContractStatus
              contractStatus={project.contract_status as 'pending' | 'approved' | 'rejected'}
              contractSentAt={project.contract_sent_at}
              contractApprovedAt={project.contract_approved_at}
              contractTerms={project.contract_terms}
              paymentTerms={project.payment_terms}
              projectScope={project.project_scope}
              revisionPolicy={project.revision_policy}
            />
          )}

          <ProjectOverviewCard
            projectName={project.name}
            projectBrief={project.brief}
            totalValue={totalValue}
            totalMilestones={totalMilestones}
            completedMilestones={completedMilestones}
            currency={displayCurrency}
            freelancerCurrency={freelancerCurrencyCode}
            startDate={project.start_date ?? undefined}
            endDate={project.end_date ?? undefined}
            branding={branding}
          />
          
          <ProjectPaymentDeliveryCard
            paymentProofRequired={project.payment_proof_required || false}
            branding={branding}
          />
          
          <ProjectInstructionsCard 
            branding={branding} 
            paymentProofRequired={project.payment_proof_required || false}
          />
          
          <ProjectMilestonesList
            milestones={project.milestones}
            onPaymentUpload={handlePaymentUpload}
            onRevisionRequest={handleRevisionRequest}
            currency={displayCurrency}
            freelancerCurrency={freelancerCurrencyCode}
            branding={branding}
            paymentProofRequired={project.payment_proof_required || false}
            token={parsedToken?.token}
          />
        </main>
      )}
      
      <ProjectFooter />
    </div>
  );
};

export default ClientProject;
