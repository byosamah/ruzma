
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';
import { Milestone } from './types';
import { useT } from '@/lib/i18n';
import DeliverableManager from './DeliverableManager';

interface FreelancerViewProps {
  milestone: Milestone;
  userType?: 'free' | 'plus' | 'pro';
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
  onShowPaymentProofPreview: () => void;
}

const FreelancerView: React.FC<FreelancerViewProps> = ({
  milestone,
  userType = 'free',
  onApprove,
  onReject,
  onDeliverableUpload,
  onDeliverableLinkUpdate,
  onShowPaymentProofPreview
}) => {
  const t = useT();

  const renderPaymentProofSection = () => {
    if (milestone.status !== 'payment_submitted' || !milestone.paymentProofUrl) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Payment proof submitted by client</p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowPaymentProofPreview}
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(milestone.paymentProofUrl, '_blank')}
              className="flex items-center space-x-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open</span>
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
              Approve Payment
            </Button>
            <Button 
              onClick={() => onReject(milestone.id)} 
              variant="outline" 
              size="sm" 
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderPaymentProofSection()}
      
      {milestone.status === 'pending' && (
        <p className="text-sm text-slate-600">Waiting for client payment</p>
      )}
      
      {milestone.status === 'approved' && (
        <p className="text-sm text-green-600">Payment approved - Client can download</p>
      )}

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
