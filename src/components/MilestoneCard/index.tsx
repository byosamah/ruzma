
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
  onUpdateMilestoneStatus?: (milestoneId: string, status: 'approved' | 'rejected') => void;
  onPaymentUpload?: (milestoneId: string, file: File) => Promise<boolean>;
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
  onStatusChange?: (milestoneId: string, status: Milestone['status']) => void;
  currency?: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isClient = false,
  onUpdateMilestoneStatus,
  onPaymentUpload,
  onDeliverableLinkUpdate,
  onStatusChange,
  currency = 'USD',
  freelancerCurrency,
  branding,
  paymentProofRequired = false,
}) => {
  return (
    <Card className="bg-white border border-gray-100 hover:border-gray-200 transition-colors">
      <CardContent className="p-6">
        <MilestoneHeader 
          milestone={milestone} 
          currency={currency}
          branding={branding}
          onStatusChange={onStatusChange ? (status) => onStatusChange(milestone.id, status) : undefined}
          isClient={isClient}
        />
        
        {isClient ? (
          <ClientView
            milestone={milestone}
            onPaymentUpload={onPaymentUpload}
            paymentProofRequired={paymentProofRequired}
          />
        ) : (
          <FreelancerView
            milestone={milestone}
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
            onDeliverableLinkUpdate={onDeliverableLinkUpdate}
            onShowPaymentProofPreview={() => {}}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;
