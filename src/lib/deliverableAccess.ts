import { Milestone } from '@/components/MilestoneCard/types';

/**
 * Determines if a client can access deliverables based on payment proof requirements
 * and milestone status
 */
export function canAccessDeliverables(
  paymentProofRequired: boolean,
  milestoneStatus: Milestone['status']
): boolean {
  // If payment proof is not required, always allow access
  if (!paymentProofRequired) {
    return true;
  }

  // If payment proof is required, only allow access when milestone is approved
  return milestoneStatus === 'approved';
}

/**
 * Gets the appropriate message to display when deliverable access is denied
 */
export function getAccessDeniedMessage(paymentProofRequired: boolean): string {
  if (paymentProofRequired) {
    return '🔒 Deliverables will be accessible after payment is approved by the freelancer.';
  }
  
  return 'Deliverables are not yet available.';
}

/**
 * Determines if the payment section should be shown based on payment proof requirements
 */
export function shouldShowPaymentSection(paymentProofRequired: boolean): boolean {
  return paymentProofRequired;
}

/**
 * Determines if payment upload UI should be shown based on milestone status and payment requirements
 */
export function shouldShowPaymentUpload(
  paymentProofRequired: boolean,
  milestoneStatus: Milestone['status']
): boolean {
  if (!paymentProofRequired) {
    return false;
  }

  return milestoneStatus === 'pending' || milestoneStatus === 'rejected';
}