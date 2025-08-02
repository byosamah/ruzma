import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  MessageSquare, 
  Download, 
  Star, 
  Share2, 
  RefreshCw,
  X,
  Plus
} from 'lucide-react';
import { DatabaseProject } from '@/types/shared';

interface MobileActionsBarProps {
  project: DatabaseProject;
  onPaymentUpload: (milestoneId: string) => void;
  onRevisionRequest: (milestoneId: string) => void;
  branding?: any;
}

const MobileActionsBar: React.FC<MobileActionsBarProps> = ({ 
  project, 
  onPaymentUpload, 
  onRevisionRequest,
  branding 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find actionable milestones
  const pendingPayments = project.milestones.filter(m => 
    m.status === 'completed' && !m.payment_proof_url
  );
  const deliveredMilestones = project.milestones.filter(m => 
    m.status === 'completed' && m.deliverable_link
  );

  const quickActions = [
    {
      id: 'payment',
      label: 'Upload Payment',
      icon: Upload,
      color: 'primary',
      count: pendingPayments.length,
      available: pendingPayments.length > 0,
      action: () => {
        if (pendingPayments.length === 1) {
          onPaymentUpload(pendingPayments[0].id);
        }
        setIsExpanded(false);
      }
    },
    {
      id: 'revision',
      label: 'Request Revision',
      icon: RefreshCw,
      color: 'amber',
      count: deliveredMilestones.length,
      available: deliveredMilestones.length > 0,
      action: () => {
        if (deliveredMilestones.length === 1) {
          onRevisionRequest(deliveredMilestones[0].id);
        }
        setIsExpanded(false);
      }
    },
    {
      id: 'message',
      label: 'Send Message',
      icon: MessageSquare,
      color: 'blue',
      count: 0,
      available: true,
      action: () => {
        // Scroll to communication section or open message modal
        const commSection = document.querySelector('[data-section="communication"]');
        if (commSection) {
          commSection.scrollIntoView({ behavior: 'smooth' });
        }
        setIsExpanded(false);
      }
    },
    {
      id: 'share',
      label: 'Share Project',
      icon: Share2,
      color: 'green',
      count: 0,
      available: true,
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: project.name,
            text: `Check out my project: ${project.name}`,
            url: window.location.href
          });
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href);
        }
        setIsExpanded(false);
      }
    }
  ];

  const availableActions = quickActions.filter(action => action.available);

  return (
    <>
      {/* Mobile Actions Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          {/* Primary Action Button */}
          <div className="flex-1">
            {pendingPayments.length > 0 ? (
              <button
                onClick={() => onPaymentUpload(pendingPayments[0].id)}
                className="w-full bg-primary text-primary-content py-3 px-4 rounded-lg font-medium flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Payment
                {pendingPayments.length > 1 && (
                  <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                    +{pendingPayments.length - 1}
                  </span>
                )}
              </button>
            ) : deliveredMilestones.length > 0 ? (
              <button
                onClick={() => onRevisionRequest(deliveredMilestones[0].id)}
                className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Request Revision
              </button>
            ) : (
              <button
                onClick={() => {
                  const commSection = document.querySelector('[data-section="communication"]');
                  if (commSection) {
                    commSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </button>
            )}
          </div>

          {/* More Actions Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-3 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"
          >
            {isExpanded ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Plus className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Actions Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                {availableActions.map(action => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`p-4 rounded-lg border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors relative`}
                  >
                    <action.icon className={`w-6 h-6 text-${action.color}-600 mx-auto mb-2`} />
                    <p className={`text-sm font-medium text-${action.color}-900`}>
                      {action.label}
                    </p>
                    {action.count > 0 && (
                      <span className={`absolute -top-2 -right-2 w-6 h-6 bg-${action.color}-500 text-white text-xs rounded-full flex items-center justify-center`}>
                        {action.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom padding for content to avoid being hidden behind the bar */}
      <div className="h-20 md:hidden" />
    </>
  );
};

export default MobileActionsBar;