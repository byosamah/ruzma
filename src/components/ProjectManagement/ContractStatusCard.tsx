import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Mail, Edit } from 'lucide-react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ContractService } from '@/services/core/ContractService';
import { useAuth } from '@/hooks/core/useAuth';
import { toast } from 'sonner';
import EditContractDialog from '@/components/CreateProject/EditContractDialog';

interface ContractStatusCardProps {
  project: DatabaseProject;
  onProjectUpdate?: () => void;
}

const ContractStatusCard: React.FC<ContractStatusCardProps> = ({ 
  project, 
  onProjectUpdate 
}) => {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!project.contract_required) {
    return null;
  }

  const getStatusInfo = () => {
    switch (project.contract_status) {
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: `Contract approved on ${project.contract_approved_at ? new Date(project.contract_approved_at).toLocaleDateString() : 'N/A'}`
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          description: project.contract_rejection_reason || 'Contract was rejected by client'
        };
      case 'pending':
        return {
          label: 'Pending Approval',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          description: project.contract_sent_at 
            ? `Sent on ${new Date(project.contract_sent_at).toLocaleDateString()}`
            : 'Contract not yet sent to client'
        };
      default:
        return {
          label: 'Not Sent',
          icon: Mail,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: 'Contract has not been sent to client yet'
        };
    }
  };

  const handleResendContract = async () => {
    if (!user) {
      toast.error('You must be logged in to resend the contract');
      return;
    }

    setIsResending(true);
    try {
      const contractService = new ContractService(user);
      await contractService.resendContractApprovalEmail(project.id);
      onProjectUpdate?.();
    } catch (error: any) {
      console.error('Error resending contract:', error);
      toast.error(error.message || 'Failed to resend contract');
    } finally {
      setIsResending(false);
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  const canResend = project.contract_status === 'pending' || 
                   project.contract_status === 'rejected' || 
                   !project.contract_status;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Contract Status</CardTitle>
            <Badge variant="outline" className={`${status.color} border-current`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-3 rounded-lg ${status.bgColor}`}>
            <p className={`text-sm font-medium ${status.color}`}>
              {status.description}
            </p>
            {project.contract_rejection_reason && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Feedback:</strong> {project.contract_rejection_reason}
              </p>
            )}
          </div>

          {project.client_email && (
            <div className="flex flex-col sm:flex-row gap-2">
              {canResend && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendContract}
                  disabled={isResending}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isResending ? 'Sending...' : 'Resend Contract'}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Contract
              </Button>
            </div>
          )}

          {!project.client_email && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <strong>Note:</strong> No client email provided. Add a client email to send contract for approval.
            </div>
          )}
        </CardContent>
      </Card>

      <EditContractDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        project={project}
        onContractUpdated={() => {
          onProjectUpdate?.();
          setShowEditDialog(false);
        }}
      />
    </>
  );
};

export default ContractStatusCard;