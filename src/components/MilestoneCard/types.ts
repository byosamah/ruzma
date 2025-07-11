
export interface Milestone {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'in_progress' | 'under_review' | 'revision_requested' | 'payment_submitted' | 'approved' | 'rejected' | 'completed' | 'on_hold' | 'cancelled';
  deliverable?: {
    name: string;
    size: number;
    url?: string;
  };
  deliverable_link?: string;
  paymentProofUrl?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MilestoneCardProps {
  milestone: Milestone;
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  onStatusChange?: (milestoneId: string, newStatus: Milestone["status"]) => void;
  isClient?: boolean;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onDeliverableDownload?: (milestoneId: string) => void;
  currency?: import('@/lib/currency').CurrencyCode;
  freelancerCurrency?: import('@/lib/currency').CurrencyCode;
}
