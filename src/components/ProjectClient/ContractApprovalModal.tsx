import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Coins, Calendar } from 'lucide-react';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" hideCloseButton={true}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <Badge variant="outline" className="text-orange-600">
              Pending Approval
            </Badge>
          </div>
          <DialogTitle className="text-2xl">Project Contract Review</DialogTitle>
          <DialogDescription>
            {freelancerName} has submitted a project proposal for your review and approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <p className="text-muted-foreground mt-2">{project.brief}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="font-semibold">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
                
                {project.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-semibold">{new Date(project.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {project.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-semibold">{new Date(project.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>
                Review the project breakdown and deliverables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((milestone, index) => (
                  <div 
                    key={milestone.id} 
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        {(milestone.start_date || milestone.end_date) && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {milestone.start_date && `From: ${new Date(milestone.start_date).toLocaleDateString()}`}
                            {milestone.start_date && milestone.end_date && ' • '}
                            {milestone.end_date && `To: ${new Date(milestone.end_date).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">${Number(milestone.price).toLocaleString()}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Terms & Conditions</CardTitle>
              <CardDescription>
                Review the detailed terms and conditions for this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">General Terms</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {project.contract_terms || "Not specified"}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Payment Terms</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {project.payment_terms || "Not specified"}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Project Scope</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {project.project_scope || "Not specified"}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Revision Policy</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {project.revision_policy || "Not specified"}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Section */}
          {!showRejectionForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Contract Decision</CardTitle>
                <CardDescription>
                  Please review the project details above and make your decision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => handleApproval('approve')} 
                    disabled={submitting}
                    className="flex-1"
                    size="lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Contract
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRejectionForm(true)}
                    disabled={submitting}
                    className="flex-1"
                    size="lg"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Request Changes</CardTitle>
                <CardDescription>
                  Please provide feedback on what needs to be changed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Please explain what changes you'd like to see in the project proposal..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => handleApproval('reject')} 
                    disabled={submitting || !rejectionReason.trim()}
                    className="flex-1"
                    variant="destructive"
                  >
                    Send Feedback
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectionForm(false);
                      setRejectionReason('');
                    }}
                    disabled={submitting}
                    className="flex-1"
                  >
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