
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';
import { Milestone } from './types';
import { useT } from '@/lib/i18n';
import DeliverableManager from './DeliverableManager';
import StatusSelector from './StatusSelector';

interface FreelancerViewProps {
  milestone: Milestone;
  userType?: 'free' | 'plus' | 'pro';
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
  onStatusChange?: (milestoneId: string, newStatus: Milestone['status']) => void;
  onShowPaymentProofPreview: () => void;
}

const FreelancerView: React.FC<FreelancerViewProps> = ({
  milestone,
  userType = 'free',
  onApprove,
  onReject,
  onDeliverableUpload,
  onDeliverableLinkUpdate,
  onStatusChange,
  onShowPaymentProofPreview
}) => {
  const t = useT();

  const renderPaymentProofSection = () => {
    if (milestone.status !== 'payment_submitted' || !milestone.paymentProofUrl) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800">{t('paymentProofSubmittedByClient')}</p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(milestone.paymentProofUrl, '_blank')} 
              className="flex items-center space-x-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('open')}</span>
            </Button>
          </div>
        </div>
        
        {onApprove && onReject && (
          <div className="flex space-x-2">
            <Button 
              onClick={() => onApprove(milestone.id)} 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('approvePayment')}
            </Button>
            <Button 
              onClick={() => onReject(milestone.id)} 
              variant="outline" 
              size="sm" 
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {t('reject')}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const getStatusMessage = () => {
    switch (milestone.status) {
      case 'pending':
        return <p className="text-sm text-slate-600">{t('statusPendingDesc')}</p>;
      case 'in_progress':
        return <p className="text-sm text-blue-600">{t('statusInProgressDesc')}</p>;
      case 'under_review':
        return <p className="text-sm text-purple-600">{t('statusUnderReviewDesc')}</p>;
      case 'revision_requested':
        return <p className="text-sm text-orange-600">{t('statusRevisionRequestedDesc')}</p>;
      case 'approved':
        return <p className="text-sm text-green-600">{t('paymentApprovedClientDownload')}</p>;
      case 'completed':
        return <p className="text-sm text-emerald-600">{t('statusCompletedDesc')}</p>;
      case 'on_hold':
        return <p className="text-sm text-gray-600">{t('statusOnHoldDesc')}</p>;
      case 'cancelled':
        return <p className="text-sm text-slate-600">{t('statusCancelledDesc')}</p>;
      default:
        return <p className="text-sm text-slate-600">{t('waitingForClientPayment')}</p>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Selector */}
      {onStatusChange && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700">{t('currentStatus')}</p>
            <p className="text-xs text-slate-500">{t('changeStatusToUpdate')}</p>
          </div>
          <StatusSelector
            milestone={milestone}
            onStatusChange={onStatusChange}
            disabled={['payment_submitted'].includes(milestone.status)}
          />
        </div>
      )}

      {renderPaymentProofSection()}
      
      {getStatusMessage()}

      <div className="pt-2 border-t">
        <DeliverableManager 
          milestone={milestone} 
          userType={userType} 
          onDeliverableUpload={onDeliverableUpload} 
          onDeliverableLinkUpdate={onDeliverableLinkUpdate} 
        />
      </div>
    </div>
  );
};

export default FreelancerView;
