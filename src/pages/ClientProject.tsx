
import React from 'react';
import { useParams } from 'react-router-dom';
import { useClientProject } from '@/hooks/useClientProject';
import ClientProjectHeader from "@/components/ProjectClient/ClientProjectHeader";
import ClientProjectLoading from "@/components/ProjectClient/ClientProjectLoading";
import ClientProjectError from "@/components/ProjectClient/ClientProjectError";
import ProjectOverviewCard from "@/components/ProjectClient/ProjectOverviewCard";
import ProjectInstructionsCard from "@/components/ProjectClient/ProjectInstructionsCard";
import ProjectMilestonesList from "@/components/ProjectClient/ProjectMilestonesList";
import ProjectFooter from "@/components/ProjectClient/ProjectFooter";
import { useIsMobile } from "@/hooks/use-mobile";

const ClientProject = () => {
  const { token } = useParams<{ token: string }>();
  const isMobile = useIsMobile();
  
  // Add debugging
  console.log('ClientProject: token from params:', token);
  console.log('ClientProject: current pathname:', window.location.pathname);
  
  const {
    project,
    isLoading,
    error,
    handlePaymentUpload,
    handleDeliverableDownload,
    userCurrency,
    freelancerCurrency, // Get freelancer's preferred currency
  } = useClientProject(token);

  if (isLoading) {
    return <ClientProjectLoading />;
  }

  if (error || !project) {
    console.log('ClientProject: error or no project:', { error, project });
    return <ClientProjectError error={error} />;
  }

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);

  // Always use freelancer's preferred currency if available, otherwise fall back to user currency
  const displayCurrency = freelancerCurrency || userCurrency;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ClientProjectHeader />
      <main className={`${isMobile ? 'max-w-full' : 'max-w-6xl'} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8`}>
        <ProjectOverviewCard
          projectName={project.name}
          projectBrief={project.brief}
          totalValue={totalValue}
          totalMilestones={totalMilestones}
          completedMilestones={completedMilestones}
          currency={displayCurrency}
          freelancerCurrency={freelancerCurrency}
        />
        <ProjectInstructionsCard />
        <ProjectMilestonesList
          milestones={project.milestones}
          onPaymentUpload={handlePaymentUpload}
          onDeliverableDownload={handleDeliverableDownload}
          currency={displayCurrency}
          freelancerCurrency={freelancerCurrency}
        />
      </main>
      <ProjectFooter />
    </div>
  );
};

export default ClientProject;
