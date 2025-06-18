
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

const ClientProject = () => {
  const { token } = useParams<{ token: string }>();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ClientProjectHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ProjectOverviewCard
          projectName={project.name}
          projectBrief={project.brief}
          totalValue={totalValue}
          totalMilestones={totalMilestones}
          completedMilestones={completedMilestones}
          currency={userCurrency}
        />
        <ProjectInstructionsCard />
        <ProjectMilestonesList
          milestones={project.milestones}
          onPaymentUpload={handlePaymentUpload}
          onDeliverableDownload={handleDeliverableDownload}
          currency={userCurrency}
        />
      </main>
      <ProjectFooter />
    </div>
  );
};

export default ClientProject;
