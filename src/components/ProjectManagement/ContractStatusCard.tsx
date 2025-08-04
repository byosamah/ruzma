import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Mail, Edit } from 'lucide-react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ContractService } from '@/services/core/ContractService';
import { useAuth } from '@/hooks/core/useAuth';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
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
  const t = useT();
  const [isResending, setIsResending] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!project.contract_required) {
    return null;
  }

  const getStatusInfo = () => {
    switch (project.contract_status) {
      case 'approved':
        return {
          label: t('approved'),
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: `${t('contractApprovedOn')} ${project.contract_approved_at ? new Date(project.contract_approved_at).toLocaleDateString() : 'N/A'}`
        };
      case 'rejected':
        return {
          label: t('rejected'),
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          description: project.contract_rejection_reason || t('contractRejectedBy')
        };
      case 'pending':
        return {
          label: t('pendingApproval'),
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          description: project.contract_sent_at 
            ? `${t('sentOn')} ${new Date(project.contract_sent_at).toLocaleDateString()}`
            : t('contractNotSentYet')
        };
      default:
        return {
          label: t('notSent'),
          icon: Mail,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: t('contractNotSentToClient')
        };
    }
  };

  const handleResendContract = async () => {
    if (!user) {
      toast.error(t('mustBeLoggedInToResend'));
      return;
    }

    setIsResending(true);
    try {
      const contractService = new ContractService(user);
      await contractService.resendContractApprovalEmail(project.id);
      onProjectUpdate?.();
    } catch (error: any) {
      console.error('Error resending contract:', error);
      toast.error(error.message || t('failedToResendContract'));
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
            <CardTitle className="text-lg">{t('contractStatus')}</CardTitle>
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
                <strong>{t('feedback')}:</strong> {project.contract_rejection_reason}
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
                  {isResending ? t('sending') : t('resendContract')}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('editContract')}
              </Button>
            </div>
          )}

          {!project.client_email && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              {t('noteNoClientEmail')}
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