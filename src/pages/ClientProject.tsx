
import React from 'react';
import { motion } from 'framer-motion';
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
import { Clock } from 'lucide-react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-base-100" data-theme="light">
      <BrandedClientHeader branding={branding} />
      
      {/* Show waiting message if contract was rejected */}
      {contractRejected && (
        <motion.div 
          className="min-h-[80vh] flex items-center justify-center px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card bg-base-100 shadow-lg border border-base-300/50 max-w-md w-full">
            <div className="card-body text-center p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-warning/10 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-warning" />
              </div>
              <h2 className="card-title text-2xl justify-center mb-4">
                Feedback Sent Successfully
              </h2>
              <p className="text-base-content/70 mb-6 leading-relaxed">
                Your feedback has been sent to the freelancer. Please wait while they review and update the contract based on your comments.
              </p>
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="text-sm">You will receive a new email once the updated contract is ready for your review.</span>
              </div>
            </div>
          </div>
        </motion.div>
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
        <motion.main 
          className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Contract Status - Show for all approved contracts */}
          {project.contract_status && (
            <motion.div variants={itemVariants}>
              <ClientContractStatus
                contractStatus={project.contract_status as 'pending' | 'approved' | 'rejected'}
                contractSentAt={project.contract_sent_at}
                contractApprovedAt={project.contract_approved_at}
                contractTerms={project.contract_terms}
                paymentTerms={project.payment_terms}
                projectScope={project.project_scope}
                revisionPolicy={project.revision_policy}
              />
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
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
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ProjectPaymentDeliveryCard
              paymentProofRequired={project.payment_proof_required || false}
              branding={branding}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ProjectInstructionsCard 
              branding={branding} 
              paymentProofRequired={project.payment_proof_required || false}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
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
          </motion.div>
        </motion.main>
      )}
      
      <ProjectFooter />
    </div>
  );
};

export default ClientProject;
