
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MilestoneCardProps } from './types';
import { getStatusColor } from './utils';
import MilestoneHeader from './MilestoneHeader';
import ClientView from './ClientView';
import FreelancerView from './FreelancerView';
import PaymentProofModal from './PaymentProofModal';

const MilestoneCard = ({
  milestone, 
  onApprove, 
  onReject, 
  isClient = false,
  onPaymentUpload,
  onDeliverableUpload,
  onDeliverableDownload,
  currency = 'USD',
  freelancerCurrency,
  onUpdateWatermark
}: MilestoneCardProps) => {
  const [showPaymentProofPreview, setShowPaymentProofPreview] = useState(false);

  return (
    <>
      <Card className={`overflow-hidden bg-white shadow-sm border-0 rounded-xl ${getStatusColor(milestone.status)}`}>
        <div className="border-l-4 border-blue-500">
          <MilestoneHeader
            title={milestone.title}
            description={milestone.description}
            price={milestone.price}
            status={milestone.status}
            currency={currency}
            freelancerCurrency={freelancerCurrency}
            start_date={milestone.start_date}
            end_date={milestone.end_date}
          />
          <CardContent className="px-6 pb-6">
            <div className="mt-4">
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
                  onUpdateWatermark={onUpdateWatermark}
                />
              )}
            </div>
          </CardContent>
        </div>
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
