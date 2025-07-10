
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, Clock, Play, Eye, RefreshCw, CheckCircle, XCircle, Pause, Ban } from 'lucide-react';
import { Milestone } from './types';
import { useT } from '@/lib/i18n';
import { getStatusIcon, getStatusColor } from './utils';

interface StatusSelectorProps {
  milestone: Milestone;
  onStatusChange: (milestoneId: string, newStatus: Milestone['status']) => void;
  disabled?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  milestone,
  onStatusChange,
  disabled = false,
}) => {
  const t = useT();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Milestone['status'] | null>(null);

  const statusOptions: Array<{
    value: Milestone['status'];
    icon: any;
    available: boolean;
    suggested?: boolean;
  }> = [
    {
      value: 'pending',
      icon: Clock,
      available: ['in_progress', 'on_hold', 'cancelled'].includes(milestone.status),
    },
    {
      value: 'in_progress',
      icon: Play,
      available: ['pending', 'on_hold', 'revision_requested'].includes(milestone.status),
      suggested: milestone.status === 'pending',
    },
    {
      value: 'under_review',
      icon: Eye,
      available: ['in_progress', 'revision_requested'].includes(milestone.status),
      suggested: milestone.status === 'in_progress' && (milestone.deliverable || milestone.deliverable_link),
    },
    {
      value: 'revision_requested',
      icon: RefreshCw,
      available: ['under_review'].includes(milestone.status),
    },
    {
      value: 'completed',
      icon: CheckCircle,
      available: ['approved', 'under_review'].includes(milestone.status),
      suggested: milestone.status === 'approved',
    },
    {
      value: 'on_hold',
      icon: Pause,
      available: ['pending', 'in_progress', 'under_review'].includes(milestone.status),
    },
    {
      value: 'cancelled',
      icon: Ban,
      available: !['completed', 'approved'].includes(milestone.status),
    },
  ];

  const getStatusTranslation = (status: Milestone['status']) => {
    const statusMap = {
      pending: t('statusPending'),
      in_progress: t('statusInProgress'),
      under_review: t('statusUnderReview'),
      revision_requested: t('statusRevisionRequested'),
      payment_submitted: t('statusPaymentSubmitted'),
      approved: t('statusApproved'),
      rejected: t('statusRejected'),
      completed: t('statusCompleted'),
      on_hold: t('statusOnHold'),
      cancelled: t('statusCancelled'),
    };
    return statusMap[status] || status;
  };

  const getStatusDescription = (status: Milestone['status']) => {
    const descMap = {
      pending: t('statusPendingDesc'),
      in_progress: t('statusInProgressDesc'),
      under_review: t('statusUnderReviewDesc'),
      revision_requested: t('statusRevisionRequestedDesc'),
      payment_submitted: t('statusPaymentSubmittedDesc'),
      approved: t('statusApprovedDesc'),
      rejected: t('statusRejectedDesc'),
      completed: t('statusCompletedDesc'),
      on_hold: t('statusOnHoldDesc'),
      cancelled: t('statusCancelledDesc'),
    };
    return descMap[status] || '';
  };

  const handleStatusSelect = (status: Milestone['status']) => {
    setSelectedStatus(status);
    setShowConfirmDialog(true);
  };

  const handleConfirmStatusChange = () => {
    if (selectedStatus) {
      onStatusChange(milestone.id, selectedStatus);
      setShowConfirmDialog(false);
      setSelectedStatus(null);
    }
  };

  const availableOptions = statusOptions.filter(option => 
    option.available && option.value !== milestone.status
  );

  const suggestedOptions = availableOptions.filter(option => option.suggested);

  const CurrentStatusIcon = getStatusIcon(milestone.status);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="flex items-center gap-2 text-sm"
          >
            <CurrentStatusIcon className="w-4 h-4" />
            {getStatusTranslation(milestone.status)}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs font-medium text-slate-500">
            {t('changeStatus')}
          </DropdownMenuLabel>
          
          {suggestedOptions.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs font-medium text-green-600">
                {t('suggestedStatus')}
              </DropdownMenuLabel>
              {suggestedOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatusSelect(option.value)}
                    className="flex flex-col items-start gap-1 p-3 bg-green-50 hover:bg-green-100"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        {getStatusTranslation(option.value)}
                      </span>
                    </div>
                    <span className="text-xs text-green-600 ml-6">
                      {getStatusDescription(option.value)}
                    </span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
            </>
          )}

          {availableOptions.filter(option => !option.suggested).map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className="flex flex-col items-start gap-1 p-3"
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <span className="font-medium">
                    {getStatusTranslation(option.value)}
                  </span>
                </div>
                <span className="text-xs text-slate-500 ml-6">
                  {getStatusDescription(option.value)}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('changeStatus')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('statusChangeConfirm')}
              {selectedStatus && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <div className="font-medium text-slate-800">
                    {getStatusTranslation(selectedStatus)}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {getStatusDescription(selectedStatus)}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStatus(null)}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StatusSelector;
