import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Milestone } from './types';
import MilestoneHeader from './MilestoneHeader';
import FreelancerView from './FreelancerView';
import ClientView from './ClientView';
import { CurrencyCode } from '@/lib/currency';
import { FreelancerBranding } from '@/types/branding';

interface MilestoneCardProps {
  milestone: Milestone;
  isClient?: boolean;
  onUpdateMilestoneStatus?: (milestoneId: string, status: 'approved' | 'rejected') => void;
  onPaymentUpload?: (milestoneId: string, file: File) => Promise<boolean>;
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
  onStatusChange?: (milestoneId: string, status: Milestone['status']) => void;
  onRevisionRequest?: (milestoneId: string, feedback: string, images: string[]) => void;
  onRevisionUpdate?: (milestoneId: string, newDeliverableLink: string) => void;
  currency?: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
  token?: string; // Client access token
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isClient = false,
  onUpdateMilestoneStatus,
  onPaymentUpload,
  onDeliverableLinkUpdate,
  onStatusChange,
  onRevisionRequest,
  onRevisionUpdate,
  currency = 'USD',
  freelancerCurrency,
  branding,
  paymentProofRequired = false,
  token,
}) => {
  return (
    <Card className="bg-gray-50 border border-gray-100">
      <CardContent className="p-4 sm:p-6">
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
            onRevisionRequest={onRevisionRequest}
            token={token}
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
            onRevisionUpdate={onRevisionUpdate}
            onShowPaymentProofPreview={() => {}}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;