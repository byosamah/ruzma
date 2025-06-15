
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, ExternalLink, Eye } from 'lucide-react';
import { Milestone } from './types';
import DeliverableWatermarkedPreview from './DeliverableWatermarkedPreview';

interface ClientViewProps {
  milestone: Milestone;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onDeliverableDownload?: (milestoneId: string) => void;
}

const ClientView: React.FC<ClientViewProps> = ({
  milestone,
  onPaymentUpload,
  onDeliverableDownload
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const handlePaymentFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPaymentUpload) {
      onPaymentUpload(milestone.id, file);
    }
  };

  const renderPaymentProofLink = () => {
    if (!milestone.paymentProofUrl) return null;
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(milestone.paymentProofUrl, '_blank')}
          className="flex items-center space-x-1"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Uploaded Proof</span>
        </Button>
        <a
          href={milestone.paymentProofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 ml-2 underline"
        >
          Direct Link
        </a>
      </div>
    );
  };

  // Helper for getting file type based on url or name
  const getDeliverableFileType = (deliverable?: { name: string, url?: string }) => {
    if (!deliverable || !deliverable.url) return '';
    const name = deliverable.name.toLowerCase();
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) return 'image/jpeg';
    return '';
  };

  const showDeliverablePreview =
    milestone.deliverable &&
    milestone.deliverable.url &&
    milestone.status !== 'approved';

  return (
    <div className="space-y-3">
      {/* Show a watermarked preview if deliverable exists and payment not approved */}
      {showDeliverablePreview && (
        <div>
          <div className="flex items-center mb-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => setShowPreview(val => !val)}
            >
              <Eye className="w-4 h-4" />
              <span className="ml-1">{showPreview ? "Hide" : "Show"} Preview</span>
            </Button>
            <span className="text-xs text-slate-600 select-none">
              {milestone.watermarkText ? `(Watermarked)` : ""}
            </span>
          </div>
          {showPreview && (
            <DeliverableWatermarkedPreview
              fileUrl={milestone.deliverable.url!}
              watermarkText={milestone.watermarkText || "Pending Payment"}
              fileType={getDeliverableFileType(milestone.deliverable)}
            />
          )}
        </div>
      )}

      {milestone.status === 'pending' && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Upload Payment Proof:</p>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handlePaymentFileUpload}
              className="hidden"
              id={`payment-${milestone.id}`}
            />
            <label htmlFor={`payment-${milestone.id}`}>
              <Button asChild size="sm">
                <span className="cursor-pointer flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Proof
                </span>
              </Button>
            </label>
          </div>
        </div>
      )}
      
      {milestone.status === 'payment_submitted' && (
        <div className="space-y-2">
          <p className="text-sm text-blue-600">Payment proof submitted. Waiting for approval...</p>
          {renderPaymentProofLink()}
        </div>
      )}
      
      {milestone.status === 'approved' && (
        <div className="space-y-2">
          {milestone.deliverable && (
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => onDeliverableDownload?.(milestone.id)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download {milestone.deliverable.name}
            </Button>
          )}
          {renderPaymentProofLink()}
        </div>
      )}
      
      {milestone.status === 'rejected' && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">Payment was rejected. Please resubmit with correct details.</p>
          {renderPaymentProofLink()}
        </div>
      )}
    </div>
  );
};

export default ClientView;
