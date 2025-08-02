import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useClientProject } from '@/hooks/useClientProject';
import { useClientBranding } from '@/hooks/useClientBranding';
import { useBrandingSystem, useBrandStyles } from '@/hooks/useBrandingSystem';
import { parseClientToken } from '@/lib/clientUrlUtils';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { parseDeliverableLinks } from '@/lib/linkUtils';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Wallet, 
  Download,
  MessageSquare,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Upload
} from 'lucide-react';
import ContractApprovalModal from "@/components/ProjectClient/ContractApprovalModal";
import PaymentUploadModal from "@/components/ProjectClient/PaymentUploadModal";
import RevisionRequestModal from "@/components/ProjectClient/RevisionRequestModal";
import ClientProjectLoading from "@/components/ProjectClient/ClientProjectLoading";
import ClientProjectError from "@/components/ProjectClient/ClientProjectError";
import BrandedLogo from "@/components/ui/BrandedLogo";
import BrandedProgress from "@/components/ui/BrandedProgress";

const ClientProjectNew = () => {
  const { token } = useParams<{ token: string }>();
  const t = useT();
  const [contractRejected, setContractRejected] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [paymentUploadModal, setPaymentUploadModal] = useState<{
    isOpen: boolean;
    milestoneId: string;
    title: string;
    price: string;
  }>({ isOpen: false, milestoneId: '', title: '', price: '' });
  const [revisionModal, setRevisionModal] = useState<{
    isOpen: boolean;
    milestoneId: string;
    title: string;
  }>({ isOpen: false, milestoneId: '', title: '' });
  
  const parsedToken = token ? parseClientToken(token) : null;
  
  const {
    project,
    isLoading,
    error,
    needsContractApproval,
    handlePaymentUpload,
    handleRevisionRequest,
    userCurrency,
    freelancerCurrency,
    refetchProject,
  } = useClientProject(parsedToken?.token, parsedToken?.isHybrid);

  const {
    branding,
    isLoading: brandingLoading,
  } = useClientBranding(project?.user_id);

  // Initialize branding system
  const { brandSystem } = useBrandingSystem(branding);
  const brandStyles = useBrandStyles(branding);

  if (isLoading || brandingLoading) {
    return <ClientProjectLoading />;
  }

  if (error || !project || !parsedToken) {
    return <ClientProjectError error={error} />;
  }

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  const displayCurrency = (freelancerCurrency as CurrencyCode) || userCurrency?.currency || 'USD';

  // Get next action milestone
  const nextActionMilestone = project.milestones.find(m => 
    m.status === 'pending_payment' || 
    (m.status === 'completed' && !m.payment_proof_url && project.payment_proof_required)
  );

  // Helper functions
  const openPaymentUpload = (milestone: any) => {
    setPaymentUploadModal({
      isOpen: true,
      milestoneId: milestone.id,
      title: milestone.title,
      price: formatCurrency(milestone.price, displayCurrency)
    });
  };

  const openRevisionRequest = (milestone: any) => {
    setRevisionModal({
      isOpen: true,
      milestoneId: milestone.id,
      title: milestone.title
    });
  };

  const closePaymentUpload = () => {
    setPaymentUploadModal({ isOpen: false, milestoneId: '', title: '', price: '' });
  };

  const closeRevisionRequest = () => {
    setRevisionModal({ isOpen: false, milestoneId: '', title: '' });
  };

  // Contract rejection flow
  if (contractRejected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div 
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Feedback Sent Successfully
          </h1>
          <p className="text-gray-600 mb-6">
            Your feedback has been sent. Please wait while the freelancer reviews and updates the contract.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              You'll receive an email once the updated contract is ready for review.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Contract approval flow
  if (needsContractApproval && !contractRejected) {
    return (
      <>
        <ContractApprovalModal
          isOpen={needsContractApproval}
          onClose={() => {}}
          project={project}
          onApprovalComplete={refetchProject}
          onRejectionComplete={() => setContractRejected(true)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BrandedLogo 
              branding={branding}
              size="md"
              showName={true}
              className="flex-1"
            />
            
            {/* Branded Progress Indicator */}
            <BrandedProgress 
              progress={progressPercentage}
              total={totalMilestones}
              completed={completedMilestones}
              branding={branding}
              size="md"
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Project Overview Hero */}
        <motion.section 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {project.name}
          </h2>
          {project.brief && (
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              {project.brief}
            </p>
          )}
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-2 ${
                branding?.primary_color 
                  ? `bg-[${branding.primary_color}]/10`
                  : 'bg-emerald-100'
              }`}>
                <Wallet className={`w-4 h-4 ${
                  branding?.primary_color 
                    ? `text-[${branding.primary_color}]`
                    : 'text-emerald-600'
                }`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalValue, displayCurrency)}
              </p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(progressPercentage)}%
              </p>
              <p className="text-sm text-gray-600">Progress</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 col-span-2 md:col-span-1">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {completedMilestones}/{totalMilestones}
              </p>
              <p className="text-sm text-gray-600">Milestones</p>
            </div>
          </div>
        </motion.section>

        {/* Next Action Card */}
        {nextActionMilestone && (
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`bg-gradient-to-r rounded-lg p-6 border ${
              branding?.primary_color 
                ? `from-[${branding.primary_color}]/5 to-[${branding.primary_color}]/10 border-[${branding.primary_color}]/20`
                : 'from-emerald-50 to-blue-50 border-emerald-200'
            }`}>
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  branding?.primary_color 
                    ? `bg-[${branding.primary_color}] text-white`
                    : 'bg-emerald-500 text-white'
                }`}>
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    Action Required: {nextActionMilestone.title}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {nextActionMilestone.status === 'pending_payment' 
                      ? 'This milestone is ready for payment to proceed.' 
                      : 'Upload your payment proof to confirm payment.'}
                  </p>
                  <button 
                    className={`btn ${
                      branding?.primary_color 
                        ? `bg-[${branding.primary_color}] hover:bg-[${brandSystem.primary[600]}] text-white border-[${branding.primary_color}]`
                        : 'btn-primary'
                    }`}
                    onClick={() => {
                      if (nextActionMilestone.status === 'pending_payment') {
                        setExpandedMilestone(nextActionMilestone.id);
                      } else {
                        openPaymentUpload(nextActionMilestone);
                      }
                    }}
                  >
                    {nextActionMilestone.status === 'pending_payment' ? 'View Details' : 'Upload Proof'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    branding?.primary_color 
                      ? `text-[${branding.primary_color}]`
                      : 'text-emerald-600'
                  }`}>
                    {formatCurrency(nextActionMilestone.price, displayCurrency)}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Milestones List */}
        <motion.section 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Project Milestones</h3>
          
          {project.milestones.map((milestone, index) => (
            <motion.div 
              key={milestone.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {/* Milestone Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.status === 'approved' 
                        ? (branding?.primary_color ? `bg-[${branding.primary_color}]/10` : 'bg-emerald-100')
                        : milestone.status === 'completed' ? 'bg-blue-100' :
                        milestone.status === 'pending_payment' ? 'bg-amber-100' :
                        'bg-gray-100'
                    }`}>
                      {milestone.status === 'approved' ? (
                        <CheckCircle2 className={`w-5 h-5 ${
                          branding?.primary_color 
                            ? `text-[${branding.primary_color}]`
                            : 'text-emerald-600'
                        }`} />
                      ) : milestone.status === 'completed' ? (
                        <Upload className="w-5 h-5 text-blue-600" />
                      ) : milestone.status === 'pending_payment' ? (
                        <Wallet className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(milestone.price, displayCurrency)}
                      </p>
                      <p className={`text-sm font-medium ${
                        milestone.status === 'approved' 
                          ? (branding?.primary_color ? `text-[${branding.primary_color}]` : 'text-emerald-600')
                          : milestone.status === 'completed' ? 'text-blue-600' :
                          milestone.status === 'pending_payment' ? 'text-amber-600' :
                          'text-gray-500'
                      }`}>
                        {milestone.status === 'approved' ? 'Approved' :
                         milestone.status === 'completed' ? 'Delivered' :
                         milestone.status === 'pending_payment' ? 'Awaiting Payment' :
                         'In Progress'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setExpandedMilestone(
                        expandedMilestone === milestone.id ? null : milestone.id
                      )}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {expandedMilestone === milestone.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Milestone Details */}
              {expandedMilestone === milestone.id && (
                <motion.div 
                  className="border-t border-gray-100 bg-gray-50 p-6"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Actions */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Available Actions</h5>
                      <div className="space-y-2">
                        
                        {/* View Deliverables */}
                        {milestone.deliverable_link && (
                          <>
                            {parseDeliverableLinks(milestone.deliverable_link).map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {link.title || 'View Deliverable'}
                                </span>
                              </a>
                            ))}
                          </>
                        )}

                        {/* Payment Upload */}
                        {milestone.status === 'completed' && !milestone.payment_proof_url && project.payment_proof_required && (
                          <button
                            onClick={() => openPaymentUpload(milestone)}
                            className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                          >
                            <Upload className={`w-4 h-4 ${
                              branding?.primary_color 
                                ? `text-[${branding.primary_color}]`
                                : 'text-emerald-600'
                            }`} />
                            <span className="text-sm font-medium text-gray-900">Upload Payment Proof</span>
                          </button>
                        )}

                        {/* Request Revision */}
                        {milestone.status === 'completed' && (
                          <button 
                            onClick={() => openRevisionRequest(milestone)}
                            className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                          >
                            <MessageSquare className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-gray-900">Request Revision</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Info */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Status Information</h5>
                      <div className="text-sm text-gray-600 space-y-2">
                        {milestone.status === 'approved' && (
                          <p className={`flex items-center space-x-2 ${
                            branding?.primary_color 
                              ? `text-[${branding.primary_color}]`
                              : 'text-emerald-600'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Milestone completed and approved</span>
                          </p>
                        )}
                        {milestone.status === 'completed' && milestone.deliverable_link && (
                          <p className="flex items-center space-x-2 text-blue-600">
                            <ArrowRight className="w-4 h-4" />
                            <span>
                              {parseDeliverableLinks(milestone.deliverable_link).length > 1
                                ? `${parseDeliverableLinks(milestone.deliverable_link).length} deliverable links available`
                                : 'Deliverable link available'}
                            </span>
                          </p>
                        )}
                        {milestone.status === 'pending_payment' && (
                          <p className="flex items-center space-x-2 text-amber-600">
                            <Wallet className="w-4 h-4" />
                            <span>Waiting for payment to proceed</span>
                          </p>
                        )}
                        {milestone.payment_proof_url && (
                          <p className={`flex items-center space-x-2 ${
                            branding?.primary_color 
                              ? `text-[${branding.primary_color}]`
                              : 'text-emerald-600'
                          }`}>
                            <Shield className="w-4 h-4" />
                            <span>Payment proof uploaded</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.section>

        {/* Trust Signals */}
        <motion.section 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure Portal</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Protected Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Professional Service</span>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Mobile Floating Action Button */}
      {nextActionMilestone && (
        <motion.div 
          className="fixed bottom-6 right-6 md:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <button 
            className={`btn btn-circle w-14 h-14 shadow-lg ${
              branding?.primary_color 
                ? `bg-[${branding.primary_color}] hover:bg-[${brandSystem.primary[600]}] text-white border-[${branding.primary_color}]`
                : 'btn-primary'
            }`}
            onClick={() => {
              if (nextActionMilestone.status === 'pending_payment') {
                setExpandedMilestone(nextActionMilestone.id);
              } else {
                openPaymentUpload(nextActionMilestone);
              }
            }}
          >
            {nextActionMilestone.status === 'pending_payment' ? (
              <ArrowRight className="w-6 h-6" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </button>
        </motion.div>
      )}

      {/* Modals */}
      <PaymentUploadModal
        isOpen={paymentUploadModal.isOpen}
        onClose={closePaymentUpload}
        onUpload={(file) => handlePaymentUpload(paymentUploadModal.milestoneId, file)}
        milestoneTitle={paymentUploadModal.title}
        milestonePrice={paymentUploadModal.price}
        branding={branding}
      />

      <RevisionRequestModal
        isOpen={revisionModal.isOpen}
        onClose={closeRevisionRequest}
        onSubmit={(feedback, images) => handleRevisionRequest(revisionModal.milestoneId, feedback, images)}
        milestoneTitle={revisionModal.title}
        branding={branding}
      />
    </div>
  );
};

export default ClientProjectNew;