import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClientProject } from '@/hooks/useClientProject';
import { useClientBranding } from '@/hooks/useClientBranding';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import ModernClientHeader from '@/components/ClientProject/ModernClientHeader';
import ModernProjectOverview from '@/components/ClientProject/ModernProjectOverview';
import ModernInstructionsCard from '@/components/ClientProject/ModernInstructionsCard';
import ModernMilestonesList from '@/components/ClientProject/ModernMilestonesList';
import ContractApprovalModal from '@/components/ProjectClient/ContractApprovalModal';
import ProjectFooter from '@/components/ProjectClient/ProjectFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { parseClientToken } from '@/lib/clientUrlUtils';
import { CurrencyCode } from '@/lib/currency';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ModernClientProject = () => {
  const { token } = useParams<{ token: string }>();
  const isMobile = useIsMobile();
  const [contractRejected, setContractRejected] = useState(false);

  // Parse the token to handle both legacy and hybrid formats
  const parsedToken = token ? parseClientToken(token) : null;

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

  // Loading State
  if (isLoading || brandingLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <Card className="border-0 rounded-none border-b">
            <div className="bg-muted/30 border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <CardContent className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Skeletons */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !project || !parsedToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h1>
            <p className="text-muted-foreground">
              {error || 'The project link appears to be invalid or expired. Please contact your freelancer for a new link.'}
            </p>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <ModernClientHeader branding={branding} />
      
      {/* Contract Rejected State */}
      {contractRejected && (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Feedback Sent Successfully</h2>
                <p className="text-muted-foreground">
                  Your feedback has been sent to the freelancer. Please wait while they review and update the contract based on your comments.
                </p>
              </div>
              <Badge variant="secondary">
                You will receive a new email once the updated contract is ready for your review.
              </Badge>
            </CardContent>
          </Card>
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
      
      {/* Main Content */}
      {!needsContractApproval && !contractRejected && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Contract Status */}
          {project.contract_status && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Contract approved and project is active
              </AlertDescription>
            </Alert>
          )}

          {/* Project Overview */}
          <ModernProjectOverview
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

          <Separator />

          {/* Instructions */}
          <ModernInstructionsCard 
            branding={branding} 
            paymentProofRequired={project.payment_proof_required || false}
          />

          <Separator />

          {/* Milestones */}
          <ModernMilestonesList
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
      
      {/* Footer */}
      <ProjectFooter />
    </div>
  );
};

export default ModernClientProject;