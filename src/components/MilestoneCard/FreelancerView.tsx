import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ExternalLink, MessageSquare, Settings } from 'lucide-react';
import { Milestone } from './types';
import { useT } from '@/lib/i18n';
import { parseRevisionData, markRevisionAddressed, updateMaxRevisions, stringifyRevisionData } from '@/lib/revisionUtils';
import DeliverableManager from './DeliverableManager';
import RevisionSettingsDropdown from './RevisionSettingsDropdown';
import RevisionDetailsModal from './RevisionDetailsModal';
interface FreelancerViewProps {
  milestone: Milestone;
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
  onShowPaymentProofPreview: () => void;
  onRevisionUpdate?: (milestoneId: string, newDeliverableLink: string) => void;
}
const FreelancerView: React.FC<FreelancerViewProps> = ({
  milestone,
  onApprove,
  onReject,
  onDeliverableLinkUpdate,
  onShowPaymentProofPreview,
  onRevisionUpdate
}) => {
  const t = useT();
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const revisionData = parseRevisionData(milestone);
  const pendingRevisions = revisionData.requests.filter(req => req.status === 'pending');

  // Debug logging to track revision data changes
  const handleRevisionSettingsUpdate = (maxRevisions: number | null) => {
    const updatedRevisionData = updateMaxRevisions(revisionData, maxRevisions);
    const newDeliverableLink = stringifyRevisionData(milestone.deliverable_link, updatedRevisionData);
    if (onRevisionUpdate) {
      onRevisionUpdate(milestone.id, newDeliverableLink);
    }
  };
  const handleMarkRevisionAddressed = (requestId: string) => {
    const updatedRevisionData = markRevisionAddressed(revisionData, requestId);
    const newDeliverableLink = stringifyRevisionData(milestone.deliverable_link, updatedRevisionData);
    if (onRevisionUpdate) {
      onRevisionUpdate(milestone.id, newDeliverableLink);
    }
  };
  const renderPaymentProofSection = () => {
    if (milestone.status !== 'payment_submitted' || !milestone.paymentProofUrl) return null;
    return <div className="space-y-3">
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800">{t('paymentProofSubmittedByClient')}</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.open(milestone.paymentProofUrl, '_blank')} className="flex items-center space-x-1">
              <ExternalLink className="w-4 h-4" />
              <span>{t('open')}</span>
            </Button>
          </div>
        </div>
        
        {onApprove && onReject && <div className="flex space-x-2">
            <Button onClick={() => onApprove(milestone.id)} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('approvePayment')}
            </Button>
            <Button onClick={() => onReject(milestone.id)} variant="outline" size="sm" className="flex-1 text-red-600 border-red-300 hover:bg-red-50">
              <XCircle className="w-4 h-4 mr-2" />
              {t('reject')}
            </Button>
          </div>}
      </div>;
  };
  return <div className="space-y-4">
      {/* Revision Management Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-medium text-gray-700">Revisions</h4>
          {pendingRevisions.length > 0 && <Button variant="outline" size="sm" onClick={() => setShowRevisionModal(true)} className="gap-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100">
              <MessageSquare className="w-3 h-3" />
              {pendingRevisions.length} Revision{pendingRevisions.length > 1 ? 's' : ''} Pending
            </Button>}
        </div>
        
        <div className="flex items-center gap-2">
          {revisionData.requests.length > 0 && <Button variant="ghost" size="sm" onClick={() => setShowRevisionModal(true)} className="text-xs gap-1">
              <MessageSquare className="w-3 h-3" />
              View All ({revisionData.requests.length})
            </Button>}
          <RevisionSettingsDropdown revisionData={revisionData} onUpdateMaxRevisions={handleRevisionSettingsUpdate} />
        </div>
      </div>

      {renderPaymentProofSection()}
      
      {milestone.status === 'pending' && <p className="text-sm text-slate-600">{t('waitingForClientPayment')}</p>}
      
      {milestone.status === 'approved' && <p className="text-sm text-green-600">{t('paymentApprovedClientDownload')}</p>}

      <div className="pt-2 border-t">
        <DeliverableManager milestone={milestone} onDeliverableLinkUpdate={onDeliverableLinkUpdate} />
      </div>

      {/* Revision Details Modal */}
      <RevisionDetailsModal isOpen={showRevisionModal} onClose={() => setShowRevisionModal(false)} revisionData={revisionData} onMarkAddressed={handleMarkRevisionAddressed} milestoneTitle={milestone.title} />
    </div>;
};
export default FreelancerView;