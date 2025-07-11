
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milestone } from '@/components/MilestoneCard/types';
import MilestoneCard from '@/components/MilestoneCard';
import { CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { CheckCircle2 } from 'lucide-react';
import { FreelancerBranding } from '@/types/branding';

interface ProjectMilestonesListProps {
  milestones: any[]; // Using any[] to match the database structure
  onPaymentUpload: (milestoneId: string, file: File) => Promise<boolean>;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

const ProjectMilestonesList: React.FC<ProjectMilestonesListProps> = ({
  milestones,
  onPaymentUpload,
  currency,
  freelancerCurrency,
  branding,
  paymentProofRequired = false,
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
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CheckCircle2 className="w-5 h-5 text-gray-600" />
          {t('projectMilestones')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transformedMilestones.map((milestone, index) => (
          <div key={milestone.id} className="relative">
            {/* Connection Line */}
            {index > 0 && (
              <div className="absolute -top-2 left-6 w-0.5 h-2 bg-gray-200" />
            )}
            
            {/* Milestone Card */}
            <div className="relative">
              <MilestoneCard
                milestone={milestone}
                isClient={true}
                onPaymentUpload={onPaymentUpload}
                currency={currency}
                freelancerCurrency={freelancerCurrency}
                branding={branding}
                paymentProofRequired={paymentProofRequired}
              />
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {milestones.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">{t('noMilestonesFound')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectMilestonesList;
