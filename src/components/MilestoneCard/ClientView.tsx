import React, { useState, useRef } from 'react';
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
  const [uploading, setUploading] = useState(false);

  // We need two refs to reset the file input for both "pending" and "rejected" states.
  const paymentInputRef = React.useRef<HTMLInputElement>(null);
  const paymentResubmitInputRef = React.useRef<HTMLInputElement>(null);

  const handlePaymentFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    variant: "pending" | "rejected"
  ) => {
    const file = event.target.files?.[0];
    if (file && onPaymentUpload) {
      setUploading(true);
      try {
        await onPaymentUpload(milestone.id, file);
      } finally {
        setUploading(false);
        // Reset the correct input after upload
        if (variant === 'pending' && paymentInputRef.current) {
          paymentInputRef.current.value = '';
        }
        if (variant === 'rejected' && paymentResubmitInputRef.current) {
          paymentResubmitInputRef.current.value = '';
        }
      }
    }
  };

  const triggerFileUpload = (inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.click();
  };

  // Helper for getting file type based on url or name
  const getDeliverableFileType = (deliverable?: { name: string, url?: string }) => {
    if (!deliverable || !deliverable.url) return '';
    const name = deliverable.name.toLowerCase();
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) return 'image/jpeg';
    return '';
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
      </div>
    );
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
              ref={paymentInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={e => handlePaymentFileUpload(e, 'pending')}
              className="hidden"
              id={`payment-${milestone.id}`}
              disabled={uploading}
            />
            <Button 
              size="sm" 
              disabled={uploading}
              onClick={() => triggerFileUpload(paymentInputRef)}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Proof'}
            </Button>
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
          <div className="flex items-center space-x-2">
            <input
              ref={paymentResubmitInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={e => handlePaymentFileUpload(e, 'rejected')}
              className="hidden"
              id={`payment-resubmit-${milestone.id}`}
              disabled={uploading}
            />
            <Button 
              size="sm" 
              disabled={uploading}
              onClick={() => triggerFileUpload(paymentResubmitInputRef)}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Resubmit Proof'}
            </Button>
          </div>
          {renderPaymentProofLink()}
        </div>
      )}
    </div>
  );
};

export default ClientView;
