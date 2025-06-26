
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Link, File } from 'lucide-react';
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
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <File className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No deliverable available yet</p>
          <p className="text-xs text-slate-400 mt-1">Your freelancer will upload the deliverable once completed</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* File Deliverable */}
        {hasFileDeliverable && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <File className="w-4 h-4" />
              File Deliverable
            </h5>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <Download className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-medium">{milestone.deliverable?.name || 'Deliverable file'}</span>
                    {milestone.deliverable?.size && (
                      <span className="text-xs text-slate-500 block">
                        {(milestone.deliverable.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    )}
                  </div>
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
                  {((milestone.status === 'approved') || !paymentProofRequired) && onDeliverableDownload && (
                    <Button
                      size="sm"
                      onClick={() => onDeliverableDownload(milestone.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                  {paymentProofRequired && milestone.status !== 'approved' && (
                    <div className="text-xs text-amber-600 px-2 py-1 bg-amber-50 rounded">
                      Payment required
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link Deliverable */}
        {hasLinkDeliverable && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Shared Link
            </h5>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <Link className="w-4 h-4" />
                  <span className="font-medium">External deliverable link</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(milestone.deliverable_link, '_blank')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Link className="w-4 h-4 mr-1" />
                  Open Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200">
      {/* Payment Section */}
      {paymentProofRequired && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Payment Status</h4>
          {renderPaymentSection()}
        </div>
      )}

      {/* Deliverable Section */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Deliverables</h4>
        {renderDeliverableSection()}
      </div>
    </div>
  );
};

export default ClientView;
