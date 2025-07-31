
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milestone } from '@/components/MilestoneCard/types';
import MilestoneCard from '@/components/MilestoneCard';
import { CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';

interface ProjectMilestonesListProps {
  milestones: any[]; // Using any[] to match the database structure
  onPaymentUpload: (milestoneId: string, file: File) => Promise<boolean>;
  onRevisionRequest?: (milestoneId: string, feedback: string, images: string[]) => Promise<void>;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
  token?: string; // Client access token
}

const ProjectMilestonesList: React.FC<ProjectMilestonesListProps> = ({
  milestones,
  onPaymentUpload,
  onRevisionRequest,
  currency,
  freelancerCurrency,
  branding,
  paymentProofRequired = false,
  token,
}) => {
  const t = useT();

  // Transform database milestones to match expected Milestone interface
  const transformedMilestones: Milestone[] = milestones.map(milestone => ({
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    price: milestone.price,
    status: milestone.status,
    deliverable_link: milestone.deliverable_link,
    paymentProofUrl: milestone.payment_proof_url,
    start_date: milestone.start_date,
    end_date: milestone.end_date,
    created_at: milestone.created_at,
    updated_at: milestone.updated_at,
  }));

  return (
    <Card className="bg-white border border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">
          📋 {t('projectMilestones')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transformedMilestones.map((milestone) => (
          <div key={milestone.id}>
            <MilestoneCard
              milestone={milestone}
              isClient={true}
              onPaymentUpload={onPaymentUpload}
              onRevisionRequest={onRevisionRequest}
              currency={currency}
              freelancerCurrency={freelancerCurrency}
              branding={branding}
              paymentProofRequired={paymentProofRequired}
              token={token}
            />
          </div>
        ))}
        
        {/* Empty State */}
        {milestones.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <span className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-4 block">📋</span>
            <p className="text-sm text-gray-500">{t('noMilestonesFound')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectMilestonesList;
