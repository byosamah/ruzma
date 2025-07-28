
import { Clock, CheckCircle, XCircle, Upload, MessageSquare, Pause } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'draft':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'in_progress':
    case 'active':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'ready_for_review':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'revision_requested':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'payment_submitted':
    case 'payment_pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'approved':
    case 'delivered':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'on_hold':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
    case 'draft':
      return Clock;
    case 'in_progress':
    case 'active':
      return Clock;
    case 'ready_for_review':
      return Upload;
    case 'revision_requested':
      return MessageSquare;
    case 'payment_submitted':
    case 'payment_pending':
      return Upload;
    case 'approved':
    case 'delivered':
      return CheckCircle;
    case 'rejected':
      return XCircle;
    case 'on_hold':
      return Pause;
    case 'cancelled':
      return XCircle;
    default:
      return Clock;
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
  const baseStatus = milestone.status || 'pending';
  
  // Check for revision requests in deliverable_link
  try {
    if (milestone.deliverable_link) {
      const data = JSON.parse(milestone.deliverable_link);
      if (data.revisionData?.requests) {
        const pendingRevisions = data.revisionData.requests.filter((req: any) => req.status === 'pending');
        if (pendingRevisions.length > 0) {
          return 'revision_requested';
        }
      }
    }
  } catch {
    // If parsing fails, continue with normal logic
  }
  
  // Enhanced status detection based on milestone properties
  if (baseStatus === 'delivered' || baseStatus === 'approved') {
    return 'delivered';
  }
  
  if (baseStatus === 'payment_submitted' && milestone.payment_proof_url) {
    return 'payment_submitted';
  }
  
  if (milestone.deliverable_link || milestone.deliverable_url) {
    return 'ready_for_review';
  }
  
  if (baseStatus === 'pending') {
    return 'in_progress';
  }
  
  return baseStatus;
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
    case 'pending':
    case 'draft':
      return 0;
    case 'in_progress':
    case 'active':
      return 25;
    case 'ready_for_review':
      return 50;
    case 'revision_requested':
      return 40; // Slight step back for revisions
    case 'payment_submitted':
    case 'payment_pending':
      return 75;
    case 'approved':
    case 'delivered':
      return 100;
    case 'rejected':
      return 0;
    case 'on_hold':
      return 10;
    case 'cancelled':
      return 0;
    default:
      return 0;
  }
};
