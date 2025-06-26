
import React from 'react';
import MilestoneCard from '@/components/MilestoneCard';
import { DatabaseMilestone } from '@/hooks/projectTypes';
import { Milestone } from '@/components/MilestoneCard/types';
import { useT } from '@/lib/i18n';

interface MilestoneListProps {
  milestones: DatabaseMilestone[];
  userCurrency: import('@/lib/currency').CurrencyCode;
  onUpdateMilestoneStatus: (milestoneId: string, newStatus: Milestone["status"]) => Promise<void>;
  onPaymentUpload: (milestoneId: string, file: File) => Promise<void>;
  onDeliverableUpload: (milestoneId: string, file: File) => Promise<void>;
  onDeliverableDownload: (milestoneId: string) => Promise<void>;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  userCurrency,
  onUpdateMilestoneStatus,
  onPaymentUpload,
  onDeliverableUpload,
  onDeliverableDownload,
}) => {
  const t = useT();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t('milestones')}</h2>
      {milestones.length === 0 ? (
        <div className="text-slate-500 text-center">{t('noMilestonesYet')}</div>
      ) : (
        <div className="space-y-5">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={{
                id: milestone.id,
                title: milestone.title,
                description: milestone.description,
                price: milestone.price,
                status: milestone.status,
                deliverable: milestone.deliverable_name ? {
                  name: milestone.deliverable_name,
                  size: milestone.deliverable_size || 0,
                  url: milestone.deliverable_url
                } : undefined,
                paymentProofUrl: milestone.payment_proof_url,
                start_date: milestone.start_date || undefined,
                end_date: milestone.end_date || undefined,
              }}
              onApprove={
                milestone.status === "payment_submitted"
                  ? (mId) => onUpdateMilestoneStatus(mId, "approved")
                  : undefined
              }
              onReject={
                milestone.status === "payment_submitted"
                  ? (mId) => onUpdateMilestoneStatus(mId, "rejected")
                  : undefined
              }
              onDeliverableUpload={onDeliverableUpload}
              onDeliverableDownload={onDeliverableDownload}
              onPaymentUpload={onPaymentUpload}
              currency={userCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MilestoneList;
