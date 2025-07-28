import React, { useState } from 'react';
import { Upload, Eye, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { parseDeliverableLinks } from '@/lib/linkUtils';
import { parseRevisionData, canRequestRevision, getRemainingRevisions } from '@/lib/revisionUtils';
import { Milestone } from './types';
import RevisionRequestDialog from './RevisionRequestDialog';

interface ClientViewProps {
  milestone: Milestone;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onRevisionRequest?: (milestoneId: string, feedback: string, images: string[]) => void;
}

const ClientView: React.FC<ClientViewProps> = ({
  milestone,
  onPaymentUpload,
  onRevisionRequest,
}) => {
  const t = useT();
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const links = parseDeliverableLinks(milestone.deliverable_link);
  const revisionData = parseRevisionData(milestone);
  const canRequest = canRequestRevision(revisionData);
  const remainingRevisions = getRemainingRevisions(revisionData);

  const handlePaymentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPaymentUpload) {
      onPaymentUpload(milestone.id, file);
    }
  };

  const handleRevisionRequest = (feedback: string, images: string[]) => {
    if (onRevisionRequest) {
      onRevisionRequest(milestone.id, feedback, images);
      setShowRevisionDialog(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status-based messages */}
      {milestone.status === 'pending' && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          Waiting for work to begin.
        </div>
      )}

      {milestone.status === 'payment_submitted' && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          💰 Your payment proof has been submitted and is being reviewed.
        </div>
      )}

      {milestone.status === 'approved' && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
          ✅ Payment approved! Work will begin soon.
        </div>
      )}

      {milestone.status === 'rejected' && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          ❌ Payment proof was rejected. Please resubmit with correct details.
        </div>
      )}

      {/* Payment Upload Section */}
      {(milestone.status === 'pending' || milestone.status === 'rejected') && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Upload Payment Proof:</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Upload screenshot or receipt of your payment
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handlePaymentUpload}
              className="hidden"
              id="payment-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('payment-upload')?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </Button>
          </div>
        </div>
      )}

      {/* Deliverable Links */}
      {links.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Deliverables:</h4>
            {onRevisionRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRevisionDialog(true)}
                disabled={!canRequest}
                className="gap-2 text-xs"
              >
                <MessageSquare className="w-3 h-3" />
                {canRequest ? 'Request Revision' : 'Revision Limit Reached'}
              </Button>
            )}
          </div>
          
          {/* Revision Counter */}
          {onRevisionRequest && (
            <div className="text-xs text-muted-foreground">
              Revisions: {remainingRevisions === null ? 'Unlimited' : `${remainingRevisions} remaining`}
            </div>
          )}
          
          <div className="space-y-2">
            {links.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{link.title}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

    {/* Revision Request Dialog */}
    <RevisionRequestDialog
      isOpen={showRevisionDialog}
      onClose={() => setShowRevisionDialog(false)}
      onSubmit={handleRevisionRequest}
      revisionData={revisionData}
      milestoneTitle={milestone.title}
    />
  </div>
);
};

export default ClientView;