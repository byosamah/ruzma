import React, { useState } from 'react';
import { Upload, Eye, FileText, ExternalLink, MessageSquare, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { parseDeliverableLinks } from '@/lib/linkUtils';
import { parseRevisionData, canRequestRevision, getRemainingRevisions } from '@/lib/revisionUtils';
import { canAccessDeliverables, getAccessDeniedMessage, shouldShowPaymentUpload } from '@/lib/deliverableAccess';
import { Milestone } from './types';
import RevisionRequestDialog from './RevisionRequestDialog';
import RevisionDetailsModal from './RevisionDetailsModal';

interface ClientViewProps {
  milestone: Milestone;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onRevisionRequest?: (milestoneId: string, feedback: string, images: string[]) => void;
  token?: string; // Client access token
  paymentProofRequired?: boolean;
}

const ClientView = ({
  milestone,
  onPaymentUpload,
  onRevisionRequest,
  token,
  paymentProofRequired = false
}) => {
  const t = useT();
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showRevisionDetails, setShowRevisionDetails] = useState(false);
  const links = parseDeliverableLinks(milestone.deliverable_link);
  const revisionData = parseRevisionData(milestone);
  const canRequest = canRequestRevision(revisionData);
  const remainingRevisions = getRemainingRevisions(revisionData);
  const hasDeliverableAccess = canAccessDeliverables(paymentProofRequired, milestone.status);
  const showPaymentUpload = shouldShowPaymentUpload(paymentProofRequired, milestone.status);

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
          {t('waitingForWorkToBegin')}
        </div>
      )}

      {milestone.status === 'payment_submitted' && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          💰 {t('paymentProofSubmittedBeingReviewed')}
        </div>
      )}

      {milestone.status === 'approved' && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
          ✅ {t('paymentApprovedWorkWillBegin')}
        </div>
      )}

      {milestone.status === 'rejected' && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          ❌ {t('paymentProofRejectedResubmit')}
        </div>
      )}

      {/* Payment Upload Section */}
      {showPaymentUpload && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">{t('uploadPaymentProof')}</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {t('uploadScreenshotReceiptPayment')}
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
              {t('chooseFile')}
            </Button>
          </div>
        </div>
      )}

      {/* Deliverable Links */}
      {links.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">{t('deliverables')}</h4>
            {hasDeliverableAccess && (
              <div className="flex gap-2">
                {revisionData.requests.length && (
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowRevisionDetails(true)}
                    className="gap-2 text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    {t('viewRevisionHistory')} ({revisionData.requests.length})
                  </Button>
                )}
                {onRevisionRequest && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRevisionDialog(true)}
                    disabled={!canRequest}
                    className="gap-2 text-xs"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {canRequest ? t('requestRevision') : t('revisionLimitReached')}
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Revision Counter */}
          {hasDeliverableAccess && onRevisionRequest && (
            <div className="text-xs text-muted-foreground">
              {t('revisions')}: {remainingRevisions === null ? t('unlimited') : `${remainingRevisions} ${t('remaining')}`}
            </div>
          )}
          
          {hasDeliverableAccess ? (
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
                      {t('view')}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                🔒 {t(getAccessDeniedMessage(paymentProofRequired))}
              </p>
            </div>
          )}
        </div>
      ) : (
        !hasDeliverableAccess && paymentProofRequired && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">{t('deliverables')}</h4>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                🔒 {t(getAccessDeniedMessage(paymentProofRequired))}
              </p>
            </div>
          </div>
        )
      )}

    {/* Revision Request Dialog */}
    <RevisionRequestDialog
      isOpen={showRevisionDialog}
      onClose={() => setShowRevisionDialog(false)}
      onSubmit={handleRevisionRequest}
      revisionData={revisionData}
      milestoneTitle={milestone.title}
      token={token}
      milestoneId={milestone.id}
    />

    {/* Revision Details Modal */}
    <RevisionDetailsModal
      isOpen={showRevisionDetails}
      onClose={() => setShowRevisionDetails(false)}
      revisionData={revisionData}
      onMarkAddressed={() => {}} // Client view is read-only
      milestoneTitle={milestone.title}
      isClientView={true}
    />
  </div>
);
};

export default ClientView;