
import React from 'react';
import MilestoneCard from '@/components/MilestoneCard';
import { DatabaseMilestone } from '@/hooks/projectTypes';
import { Milestone } from '@/components/MilestoneCard/types';
import { useT } from '@/lib/i18n';

interface MilestoneListProps {
  milestones: DatabaseMilestone[];
  userCurrency: import('@/lib/currency').CurrencyCode;
  userType?: 'free' | 'plus' | 'pro';
  onUpdateMilestoneStatus: (milestoneId: string, newStatus: Milestone["status"]) => Promise<void>;
  onStatusChange: (milestoneId: string, newStatus: Milestone["status"]) => Promise<void>;
  onPaymentUpload: (milestoneId: string, file: File) => Promise<void>;
  onDeliverableUpload: (milestoneId: string, file: File) => Promise<void>;
  onDeliverableLinkUpdate: (milestoneId: string, link: string) => Promise<void>;
  onDeliverableDownload: (milestoneId: string) => Promise<void>;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  userCurrency,
  userType = 'free',
  onUpdateMilestoneStatus,
  onStatusChange,
  onPaymentUpload,
  onDeliverableUpload,
  onDeliverableLinkUpdate,
  onDeliverableDownload,
}) => {
  const t = useT();

  const handlePaymentUpload = async (milestoneId: string, file: File): Promise<boolean> => {
    try {
      await onPaymentUpload(milestoneId, file);
      return true;
    } catch (error) {
      console.error('Payment upload failed:', error);
      return false;
    }
  };

  const handleDeliverableLinkUpdate = async (milestoneId: string, link: string) => {
    try {
      await onDeliverableLinkUpdate(milestoneId, link);
    } catch (error) {
      console.error('Deliverable link update failed:', error);
    }
  };

  const handleStatusChange = async (milestoneId: string, newStatus: Milestone["status"]) => {
    try {
      await onStatusChange(milestoneId, newStatus);
    } catch (error) {
      console.error('Status change failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500">{t('noMilestonesYet')}</p>
        </div>
      ) : (
        <div className="space-y-4">
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
                deliverable_link: milestone.deliverable_link,
                paymentProofUrl: milestone.payment_proof_url,
                start_date: milestone.start_date || undefined,
                end_date: milestone.end_date || undefined,
                created_at: milestone.created_at,
                updated_at: milestone.updated_at,
              }}
              userType={userType}
              onUpdateMilestoneStatus={
                milestone.status === "payment_submitted"
                  ? (mId, status) => onUpdateMilestoneStatus(mId, status)
                  : undefined
              }
              onStatusChange={handleStatusChange}
              onDeliverableUpload={onDeliverableUpload}
              onDeliverableLinkUpdate={handleDeliverableLinkUpdate}
              onDeliverableDownload={onDeliverableDownload}
              onPaymentUpload={handlePaymentUpload}
              currency={userCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MilestoneList;
