
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, ExternalLink, Link } from 'lucide-react';
import { Milestone } from './types';
import { useT } from '@/lib/i18n';
import PaymentUploadDialog from './PaymentUploadDialog';
import MilestoneDeliverablePreview from './MilestoneDeliverablePreview';

interface ClientViewProps {
  milestone: Milestone;
  onPaymentUpload?: (milestoneId: string, file: File) => Promise<boolean>;
  onDeliverableDownload?: (milestoneId: string) => void;
  paymentProofRequired?: boolean;
}

const ClientView: React.FC<ClientViewProps> = ({
  milestone,
  onPaymentUpload,
  onDeliverableDownload,
  paymentProofRequired = false,
}) => {
  const t = useT();

  const renderPaymentSection = () => {
    if (milestone.status === 'approved') {
      return (
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-green-800">Payment confirmed</p>
          <p className="text-xs text-green-600 mt-1">This milestone has been completed and paid</p>
        </div>
      );
    }

    if (milestone.status === 'rejected') {
      return (
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-red-800">Payment rejected</p>
          <p className="text-xs text-red-600 mt-1">Please submit valid payment proof</p>
        </div>
      );
    }

    if (milestone.status === 'payment_submitted') {
      return (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Payment proof submitted</p>
          <p className="text-xs text-blue-600 mt-1">Waiting for freelancer approval</p>
        </div>
      );
    }

    // Pending status - show payment upload
    return (
      <div className="space-y-3">
        {paymentProofRequired && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-sm font-medium text-amber-800">Payment proof required</p>
            <p className="text-xs text-amber-600 mt-1">Please upload proof of payment for this milestone</p>
          </div>
        )}
        
        <PaymentUploadDialog
          milestoneId={milestone.id}
          onPaymentUpload={onPaymentUpload}
          trigger={
            <Button size="sm" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {paymentProofRequired ? 'Upload Payment Proof' : 'Mark as Paid'}
            </Button>
          }
        />
      </div>
    );
  };

  const renderDeliverableSection = () => {
    const hasFileDeliverable = milestone.deliverable?.url;
    const hasLinkDeliverable = milestone.deliverable_link;
    
    if (!hasFileDeliverable && !hasLinkDeliverable) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">No deliverable available yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* File Deliverable */}
        {hasFileDeliverable && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-slate-700">File Deliverable</h5>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Download className="w-4 h-4" />
                <span>{milestone.deliverable?.name}</span>
                {milestone.deliverable?.size && (
                  <span className="text-xs text-slate-400">
                    ({(milestone.deliverable.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {milestone.status !== 'approved' && (
                  <MilestoneDeliverablePreview
                    milestoneId={milestone.id}
                    deliverableUrl={milestone.deliverable?.url}
                    deliverableName={milestone.deliverable?.name}
                    status={milestone.status}
                  />
                )}
                {milestone.status === 'approved' && onDeliverableDownload && (
                  <Button
                    size="sm"
                    onClick={() => onDeliverableDownload(milestone.id)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Link Deliverable */}
        {hasLinkDeliverable && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-slate-700">Shared Link</h5>
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <Link className="w-4 h-4" />
                <span>Deliverable link provided</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(milestone.deliverable_link, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open Link
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Payment Section */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Payment</h4>
        {renderPaymentSection()}
      </div>

      {/* Deliverable Section */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Deliverable</h4>
        {renderDeliverableSection()}
      </div>
    </div>
  );
};

export default ClientView;
