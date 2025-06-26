
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
import { useIsMobile } from "@/hooks/use-mobile";
import { parseClientToken } from "@/lib/clientUrlUtils";
import { CurrencyCode } from "@/lib/currency";

const ClientProject = () => {
  const { token } = useParams<{ token: string }>();
  const isMobile = useIsMobile();
  
  console.log('ClientProject: token from params:', token);
  console.log('ClientProject: current pathname:', window.location.pathname);
  
  // Parse the token to handle both legacy and hybrid formats
  const parsedToken = token ? parseClientToken(token) : null;
  console.log('ClientProject: parsed token:', parsedToken);
  
  const {
    project,
    isLoading,
    error,
    handlePaymentUpload,
    handleDeliverableDownload,
    userCurrency,
    freelancerCurrency,
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
    <div className="min-h-screen bg-slate-50">
      <BrandedClientHeader branding={branding} />
      
      <main className={`${isMobile ? 'max-w-full' : 'max-w-6xl'} mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8`}>
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
          onDeliverableDownload={handleDeliverableDownload}
          currency={displayCurrency}
          freelancerCurrency={freelancerCurrencyCode}
          branding={branding}
          paymentProofRequired={project.payment_proof_required || false}
        />
      </main>
      
      <ProjectFooter />
    </div>
  );
};

export default ClientProject;
