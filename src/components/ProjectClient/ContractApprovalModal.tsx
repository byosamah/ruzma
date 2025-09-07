import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatabaseProject } from '@/hooks/projectTypes';
import { formatCurrency } from '@/lib/currency';

interface ContractApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DatabaseProject;
  onApprovalComplete: () => void;
  onRejectionComplete: () => void;
}

function ContractApprovalModal({
  isOpen,
  onClose,
  project,
  onApprovalComplete,
  onRejectionComplete
}: ContractApprovalModalProps) {
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
      
    } catch (error: Error | unknown) {
      // Error processing contract handled by UI
      toast.error(error instanceof Error ? error.message : 'Failed to process contract approval');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" hideCloseButton={true}>
        <DialogHeader className="space-y-4">
          <div className="text-center space-y-2">
            <span className="text-4xl">📋</span>
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
              Pending Approval
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-medium text-gray-900 text-center">
            Project Contract Review
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 text-center max-w-md mx-auto">
            {freelancerName} has submitted a project proposal for your review and approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Project Details - Dashboard Style */}
          <Card className="border-0 shadow-none bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💼</span>
                <CardTitle className="text-base font-medium text-gray-900">Project Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{project.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{project.brief}</p>
              </div>
              
              {/* Project Stats - Dashboard Style Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-xs text-gray-500">Total Value</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(totalValue, 'USD')}
                    </p>
                  </div>
                </div>
                
                {project.start_date && (
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📅</span>
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {project.end_date && (
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(project.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Milestones - Dashboard Style */}
          <Card className="border-0 shadow-none bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📊</span>
                  <CardTitle className="text-base font-medium text-gray-900">Project Milestones</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {project.milestones.length} milestones
                </Badge>
              </div>
              <CardDescription className="text-xs text-gray-500">
                Review the project breakdown and deliverables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-lg">📋</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">{milestone.title}</h4>
                          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{milestone.description}</p>
                          {(milestone.start_date || milestone.end_date) && (
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              {milestone.start_date && (
                                <span>From: {new Date(milestone.start_date).toLocaleDateString()}</span>
                              )}
                              {milestone.end_date && (
                                <span>To: {new Date(milestone.end_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-3 text-xs">
                        {formatCurrency(Number(milestone.price), 'USD')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Terms - Dashboard Style */}
          <Card className="border-0 shadow-none bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📄</span>
                <CardTitle className="text-base font-medium text-gray-900">Contract Terms & Conditions</CardTitle>
              </div>
              <CardDescription className="text-xs text-gray-500">
                Review the detailed terms and conditions for this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm">📋</span>
                    <h4 className="text-sm font-medium text-gray-900">General Terms</h4>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {project.contract_terms || "Not specified"}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm">💳</span>
                    <h4 className="text-sm font-medium text-gray-900">Payment Terms</h4>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {project.payment_terms || "Not specified"}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm">🎯</span>
                    <h4 className="text-sm font-medium text-gray-900">Project Scope</h4>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {project.project_scope || "Not specified"}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm">🔄</span>
                    <h4 className="text-sm font-medium text-gray-900">Revision Policy</h4>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {project.revision_policy || "Not specified"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Section - Dashboard Style */}
          {!showRejectionForm ? (
            <Card className="border-0 shadow-none bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">✅</span>
                  <CardTitle className="text-base font-medium text-gray-900">Contract Decision</CardTitle>
                </div>
                <CardDescription className="text-xs text-gray-500">
                  Please review the project details above and make your decision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleApproval('approve')} 
                    disabled={submitting}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium border-0 shadow-none"
                    size="lg"
                  >
                    <span className="text-sm mr-2">✅</span>
                    Approve Contract
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRejectionForm(true)}
                    disabled={submitting}
                    className="flex-1 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    size="lg"
                  >
                    <span className="text-sm mr-2">📝</span>
                    Request Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-none bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📝</span>
                  <CardTitle className="text-base font-medium text-gray-900">Request Changes</CardTitle>
                </div>
                <CardDescription className="text-xs text-gray-500">
                  Please provide feedback on what needs to be changed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Please explain what changes you'd like to see in the project proposal..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="bg-white border-gray-200 text-gray-900"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleApproval('reject')} 
                    disabled={submitting || !rejectionReason.trim()}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium border-0 shadow-none"
                  >
                    <span className="text-sm mr-2">📤</span>
                    Send Feedback
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectionForm(false);
                      setRejectionReason('');
                    }}
                    disabled={submitting}
                    className="flex-1 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                  >
                    <span className="text-sm mr-2">❌</span>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractApprovalModal;