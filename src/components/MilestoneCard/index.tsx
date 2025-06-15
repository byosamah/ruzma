
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MilestoneCardProps } from './types';
import { getStatusColor } from './utils';
import MilestoneHeader from './MilestoneHeader';
import ClientView from './ClientView';
import FreelancerView from './FreelancerView';
import PaymentProofModal from './PaymentProofModal';

const MilestoneCard: React.FC<MilestoneCardProps> = ({ 
  milestone, 
  onApprove, 
  onReject, 
  isClient = false,
  onPaymentUpload,
  onDeliverableUpload,
  onDeliverableDownload,
  currency = 'USD'
}) => {
  const [showPaymentProofPreview, setShowPaymentProofPreview] = useState(false);

  return (
    <>
      <Card className={`transition-all duration-200 ${getStatusColor(milestone.status)} border-l-4`}>
        <MilestoneHeader
          title={milestone.title}
          description={milestone.description}
          price={milestone.price}
          status={milestone.status}
          currency={currency}
        />
        <CardContent>
          <div className="space-y-4">
            {isClient ? (
              <ClientView
                milestone={milestone}
                onPaymentUpload={onPaymentUpload}
                onDeliverableDownload={onDeliverableDownload}
              />
            ) : (
              <FreelancerView
                milestone={milestone}
                onApprove={onApprove}
                onReject={onReject}
                onDeliverableUpload={onDeliverableUpload}
                onShowPaymentProofPreview={() => setShowPaymentProofPreview(true)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Proof Preview Modal */}
      {showPaymentProofPreview && milestone.paymentProofUrl && (
        <PaymentProofModal
          paymentProofUrl={milestone.paymentProofUrl}
          onClose={() => setShowPaymentProofPreview(false)}
          onApprove={onApprove}
          onReject={onReject}
          milestoneId={milestone.id}
        />
      )}
    </>
  );
};

export default MilestoneCard;
