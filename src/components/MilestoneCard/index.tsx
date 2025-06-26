
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Milestone } from './types';
import MilestoneHeader from './MilestoneHeader';
import FreelancerView from './FreelancerView';
import ClientView from '../ProjectClient/ClientView';
import { CurrencyCode } from '@/lib/currency';
import { FreelancerBranding } from '@/types/branding';

interface MilestoneCardProps {
  milestone: Milestone;
  isClient?: boolean;
  userType?: 'free' | 'plus' | 'pro';
  onUpdateMilestoneStatus?: (milestoneId: string, status: 'approved' | 'rejected') => void;
  onPaymentUpload?: (milestoneId: string, file: File) => Promise<boolean>;
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
  onDeliverableDownload?: (milestoneId: string) => void;
  currency?: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isClient = false,
  userType = 'free',
  onUpdateMilestoneStatus,
  onPaymentUpload,
  onDeliverableUpload,
  onDeliverableLinkUpdate,
  onDeliverableDownload,
  currency = 'USD',
  freelancerCurrency,
  branding,
  paymentProofRequired = false,
}) => {
  const primaryColor = branding?.primary_color || '#4B72E5';

  return (
    <Card className="bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <MilestoneHeader 
          milestone={milestone} 
          currency={currency}
          branding={branding}
        />
        
        {isClient ? (
          <ClientView
            milestone={milestone}
            onPaymentUpload={onPaymentUpload}
            onDeliverableDownload={onDeliverableDownload}
            paymentProofRequired={paymentProofRequired}
          />
        ) : (
          <FreelancerView
            milestone={milestone}
            userType={userType}
            onApprove={
              milestone.status === "payment_submitted" && onUpdateMilestoneStatus
                ? (mId) => onUpdateMilestoneStatus(mId, "approved")
                : undefined
            }
            onReject={
              milestone.status === "payment_submitted" && onUpdateMilestoneStatus
                ? (mId) => onUpdateMilestoneStatus(mId, "rejected")
                : undefined
            }
            onDeliverableUpload={onDeliverableUpload}
            onDeliverableLinkUpdate={onDeliverableLinkUpdate}
            onShowPaymentProofPreview={() => {}}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;
