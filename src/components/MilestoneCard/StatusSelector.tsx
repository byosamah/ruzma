
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Clock, Play, Eye, RotateCcw, CheckCircle, Pause, X } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Milestone } from './types';
import { getStatusColor, getStatusIcon } from './utils';

interface StatusSelectorProps {
  milestone: Milestone;
  onStatusChange: (milestoneId: string, newStatus: Milestone["status"]) => void;
  disabled?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  milestone,
  onStatusChange,
  disabled = false
}) => {
  const t = useT();
  const [selectedStatus, setSelectedStatus] = useState<Milestone["status"] | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Define available status transitions based on current status
  const getAvailableStatuses = (currentStatus: Milestone["status"]): Milestone["status"][] => {
    switch (currentStatus) {
      case 'pending':
        return ['in_progress', 'on_hold', 'cancelled'];
      case 'in_progress':
        return ['under_review', 'on_hold', 'cancelled'];
      case 'under_review':
        return ['revision_requested', 'completed', 'in_progress'];
      case 'revision_requested':
        return ['in_progress', 'under_review', 'cancelled'];
      case 'payment_submitted':
        return ['approved', 'rejected'];
      case 'approved':
        return ['completed'];
      case 'rejected':
        return ['pending'];
      case 'completed':
        return ['revision_requested']; // Allow reopening if needed
      case 'on_hold':
        return ['in_progress', 'cancelled'];
      case 'cancelled':
        return ['pending']; // Allow reactivation
      default:
        return [];
    }
  };

  const getStatusIcon = (status: Milestone["status"]) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return Play;
      case 'under_review': return Eye;
      case 'revision_requested': return RotateCcw;
      case 'payment_submitted': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return X;
      case 'completed': return CheckCircle;
      case 'on_hold': return Pause;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const getStatusSuggestion = (status: Milestone["status"]) => {
    switch (status) {
      case 'in_progress':
        return milestone.deliverable?.url || milestone.deliverable_link 
          ? "You have uploaded deliverables. Consider marking as 'Under Review'."
          : "Start working and upload your deliverables when ready.";
      case 'under_review':
        return "Waiting for client feedback. They can request revisions or approve.";
      case 'revision_requested':
        return "Client requested changes. Review feedback and continue working.";
      case 'completed':
        return "This milestone is fully completed and delivered.";
      case 'on_hold':
        return "Work is paused. Resume when ready to continue.";
      default:
        return "";
    }
  };

  const handleStatusSelect = (newStatus: Milestone["status"]) => {
    setSelectedStatus(newStatus);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (selectedStatus) {
      onStatusChange(milestone.id, selectedStatus);
      setShowConfirmDialog(false);
      setSelectedStatus(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setSelectedStatus(null);
  };

  const availableStatuses = getAvailableStatuses(milestone.status);
  const StatusIcon = getStatusIcon(milestone.status);

  if (availableStatuses.length === 0 || disabled) {
    return (
      <Badge className={getStatusColor(milestone.status)}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {t(milestone.status)}
      </Badge>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(milestone.status)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {t(milestone.status)}
          </Badge>
          <Select onValueChange={handleStatusSelect}>
            <SelectTrigger className="w-auto h-8 px-2">
              <ChevronDown className="w-4 h-4" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((status) => {
                const Icon = getStatusIcon(status);
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{t(status)}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        {getStatusSuggestion(milestone.status) && (
          <p className="text-xs text-muted-foreground">
            {getStatusSuggestion(milestone.status)}
          </p>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmStatusChange')}</AlertDialogTitle>
            <AlertDialogDescription>
              Change status from "{t(milestone.status)}" to "{selectedStatus ? t(selectedStatus) : ''}"?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                {selectedStatus ? t(`${selectedStatus}Desc`) : ''}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StatusSelector;
