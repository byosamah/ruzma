import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Coins, Calendar, FileText, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatabaseProject } from '@/hooks/projectTypes';

interface ContractApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DatabaseProject;
  onApprovalComplete: () => void;
  onRejectionComplete: () => void;
}

const ContractApprovalModal: React.FC<ContractApprovalModalProps> = ({
  isOpen,
  onClose,
  project,
  onApprovalComplete,
  onRejectionComplete
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const totalValue = project.milestones.reduce((sum, milestone) => sum + Number(milestone.price), 0);
  const freelancerName = 'Freelancer'; // We'll get this from the project data if available

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('approve-contract', {
        body: {
          approvalToken: project.contract_approval_token,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (action === 'approve') {
        toast.success('Contract approved successfully! You now have access to the project.');
        onApprovalComplete();
        onClose();
      } else {
        toast.success('Feedback sent to freelancer successfully');
        onRejectionComplete();
      }
      
    } catch (error: any) {
      console.error('Error processing contract:', error);
      toast.error(error.message || 'Failed to process contract approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0" hideCloseButton={true}>
        <motion.div 
          className="bg-base-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 sm:p-8 border-b border-base-300/50">
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="w-8 h-8 text-warning" />
                </div>
                <div className="badge badge-warning badge-lg">
                  Awaiting Your Approval
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-base-content">
                Project Contract Review
              </h1>
              <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                {freelancerName} has submitted a detailed project proposal. Review the terms below and decide if you'd like to proceed.
              </p>
            </motion.div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Project Overview - Conversion Focused */}
            <motion.div 
              className="card bg-base-100 shadow-lg border border-base-300/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="card-body p-6 sm:p-8">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-base-content">
                    {project.name}
                  </h2>
                  {project.brief && (
                    <p className="text-base-content/70 text-lg leading-relaxed max-w-3xl mx-auto">
                      {project.brief}
                    </p>
                  )}
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="p-4 bg-success/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Coins className="w-8 h-8 text-success" />
                      </div>
                      <div className="text-3xl font-bold text-success mb-1">
                        ${totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-base-content/60 uppercase tracking-wide">
                        Total Value
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Target className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {project.milestones.length}
                      </div>
                      <div className="text-sm text-base-content/60 uppercase tracking-wide">
                        Milestones
                      </div>
                    </div>
                    
                    {(project.start_date || project.end_date) && (
                      <div className="text-center">
                        <div className="p-4 bg-info/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-info" />
                        </div>
                        <div className="text-lg font-bold text-info mb-1">
                          {project.start_date && project.end_date ? 
                            `${Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 3600 * 24))} days` :
                            project.start_date ? 'Starts Soon' : 'Deadline Set'
                          }
                        </div>
                        <div className="text-sm text-base-content/60 uppercase tracking-wide">
                          Duration
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Milestones - Clean List */}
            <motion.div 
              className="card bg-base-100 shadow-sm border border-base-300/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="card-body p-6 sm:p-8">
                <h3 className="text-xl font-bold text-base-content mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-primary" />
                  Project Milestones
                </h3>
                <div className="space-y-3">
                  {project.milestones.map((milestone, index) => (
                    <motion.div 
                      key={milestone.id}
                      className="p-4 border border-base-300/50 rounded-lg hover:bg-base-200/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base-content mb-2">
                            {index + 1}. {milestone.title}
                          </h4>
                          <p className="text-base-content/70 text-sm mb-3">
                            {milestone.description}
                          </p>
                          {(milestone.start_date || milestone.end_date) && (
                            <div className="text-xs text-base-content/50">
                              {milestone.start_date && `Start: ${new Date(milestone.start_date).toLocaleDateString()}`}
                              {milestone.start_date && milestone.end_date && ' • '}
                              {milestone.end_date && `End: ${new Date(milestone.end_date).toLocaleDateString()}`}
                            </div>
                          )}
                        </div>
                        <div className="badge badge-success badge-lg">
                          ${Number(milestone.price).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contract Terms - Collapsible */}
            <motion.div 
              className="collapse collapse-arrow bg-base-100 border border-base-300/50 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <input type="checkbox" /> 
              <div className="collapse-title text-xl font-medium">
                Contract Terms & Conditions
              </div>
              <div className="collapse-content space-y-6">
                {[
                  { title: 'General Terms', content: project.contract_terms },
                  { title: 'Payment Terms', content: project.payment_terms },
                  { title: 'Project Scope', content: project.project_scope },
                  { title: 'Revision Policy', content: project.revision_policy }
                ].map((section, index) => (
                  <div key={index}>
                    <h5 className="font-semibold mb-2">{section.title}</h5>
                    <div className="bg-base-200/50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-base-content/80">
                        {section.content || "Not specified"}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Decision Section - Conversion Focused */}
            <AnimatePresence mode="wait">
              {!showRejectionForm ? (
                <motion.div 
                  className="card bg-gradient-to-r from-primary/5 to-success/5 shadow-lg border border-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="card-body p-6 sm:p-8 text-center">
                    <h3 className="text-2xl font-bold text-base-content mb-2">
                      Ready to Start This Project?
                    </h3>
                    <p className="text-base-content/70 mb-8 text-lg">
                      Review complete. Choose your next step below.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                      <motion.button 
                        className="btn btn-success btn-lg"
                        onClick={() => handleApproval('approve')} 
                        disabled={submitting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve & Start
                      </motion.button>
                      
                      <motion.button 
                        className="btn btn-outline btn-lg"
                        onClick={() => setShowRejectionForm(true)}
                        disabled={submitting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Request Changes
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="card bg-base-100 shadow-lg border border-warning/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="card-body p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-base-content mb-2">
                      Request Changes
                    </h3>
                    <p className="text-base-content/70 mb-6">
                      Please provide detailed feedback on what needs to be modified.
                    </p>
                    
                    <Textarea
                      placeholder="Explain what changes you'd like to see in the project proposal..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="mb-6"
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button 
                        className="btn btn-warning flex-1"
                        onClick={() => handleApproval('reject')} 
                        disabled={submitting || !rejectionReason.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Send Feedback
                      </motion.button>
                      <motion.button 
                        className="btn btn-ghost flex-1"
                        onClick={() => {
                          setShowRejectionForm(false);
                          setRejectionReason('');
                        }}
                        disabled={submitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractApprovalModal;