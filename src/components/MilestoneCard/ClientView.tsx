
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Clock, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { Milestone } from './types';
import { useT } from '@/lib/i18n';

interface ClientViewProps {
  milestone: Milestone;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onDeliverableDownload?: (milestoneId: string) => void;
  paymentProofRequired?: boolean;
}

const ClientView: React.FC<ClientViewProps> = ({
  milestone,
  onPaymentUpload,
  onDeliverableDownload,
  paymentProofRequired = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const t = useT();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPaymentUpload) {
      setUploading(true);
      try {
        await onPaymentUpload(milestone.id, file);
      } finally {
        setUploading(false);
      }
    }
  };

  const getStatusMessage = () => {
    if (paymentProofRequired) {
      switch (milestone.status) {
        case 'pending':
          return {
            icon: Lock,
            message: t('paymentProofRequiredForDownload'),
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200'
          };
        case 'payment_submitted':
          return {
            icon: AlertCircle,
            message: t('paymentUnderReview'),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
          };
        case 'approved':
          return {
            icon: CheckCircle,
            message: t('paymentApprovedReadyToDownload'),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
          };
        default:
          return {
            icon: Clock,
            message: t('statusUnknown'),
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
          };
      }
    } else {
      // When payment proof is not required, deliverables are available immediately
      return {
        icon: CheckCircle,
        message: t('deliverableReadyForDownload'),
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo.icon;

  // Determine if download should be enabled
  const canDownload = paymentProofRequired ? milestone.status === 'approved' : true;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      {/* Status Display */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.message}
        </span>
      </div>

      {/* Payment Proof Required Notice */}
      {paymentProofRequired && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Payment Proof Required</span>
          </div>
          <p className="text-xs text-blue-700">
            This freelancer requires payment proof before deliverables can be downloaded.
          </p>
        </div>
      )}

      {/* Payment Upload Section */}
      {paymentProofRequired && milestone.status === 'pending' && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">{t('submitPaymentProof')}</h4>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id={`payment-upload-${milestone.id}`}
            />
            <label htmlFor={`payment-upload-${milestone.id}`}>
              <Button
                asChild
                size="sm"
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? t('uploading') : t('uploadPaymentProof')}
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-slate-500">
            {t('acceptedFormats')}: JPG, PNG, PDF (Max 10MB)
          </p>
        </div>
      )}

      {/* Payment Submitted Info */}
      {paymentProofRequired && milestone.status === 'payment_submitted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {t('paymentProofSubmittedSuccessfully')}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {t('freelancerWillReviewShortly')}
          </p>
        </div>
      )}

      {/* Deliverable Download Section */}
      {milestone.deliverable?.url && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">{t('downloadDeliverable')}</h4>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => canDownload && onDeliverableDownload?.(milestone.id)}
              size="sm"
              disabled={!canDownload}
              className={`${canDownload ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'} text-white`}
            >
              {canDownload ? (
                <Download className="w-4 h-4 mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {canDownload ? t('downloadFile') : t('paymentRequired')}
            </Button>
            {milestone.deliverable?.name && (
              <span className="text-sm text-slate-600">
                {milestone.deliverable.name}
              </span>
            )}
          </div>
          {canDownload ? (
            <p className="text-xs text-green-600">
              {t('deliverableReadyForDownload')}
            </p>
          ) : (
            <p className="text-xs text-amber-600">
              {t('uploadPaymentProofToDownload')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientView;
