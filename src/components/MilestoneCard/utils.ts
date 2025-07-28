
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'payment_submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return Clock;
    case 'payment_submitted': return Clock;
    case 'approved': return CheckCircle;
    case 'rejected': return XCircle;
    default: return Clock;
  }
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return '';
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  } else if (startDate) {
    return `From ${formatDate(startDate)}`;
  } else if (endDate) {
    return `Until ${formatDate(endDate)}`;
  }
  
  return '';
};

export const isPdfFile = (url: string) => {
  return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

// Smart status detection functions
export const getSmartStatus = (milestone: any): string => {
  // Keep existing status logic for backward compatibility
  const currentStatus = milestone.status;
  
  // Auto-detect based on milestone state
  if (milestone.paymentProofUrl && currentStatus === 'pending') {
    return 'payment_submitted';
  }
  
  if (milestone.deliverable_link && currentStatus === 'pending') {
    return 'ready_for_review';
  }
  
  return currentStatus;
};

export const shouldAutoUpdateStatus = (
  milestone: any, 
  action: 'deliverable_added' | 'payment_proof_uploaded' | 'payment_approved' | 'payment_rejected'
): string | null => {
  const currentStatus = milestone.status;
  
  switch (action) {
    case 'deliverable_added':
      if (currentStatus === 'pending') return 'ready_for_review';
      break;
    case 'payment_proof_uploaded':
      if (currentStatus === 'pending' || currentStatus === 'ready_for_review') {
        return 'payment_submitted';
      }
      break;
    case 'payment_approved':
      return 'approved';
    case 'payment_rejected':
      return 'rejected';
  }
  
  return null;
};

export const getStatusProgress = (status: string): number => {
  switch (status) {
    case 'pending': return 25;
    case 'ready_for_review': return 50;
    case 'payment_submitted': return 75;
    case 'approved': return 100;
    case 'rejected': return 0;
    default: return 0;
  }
};
