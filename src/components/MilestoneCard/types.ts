
export interface Milestone {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  deliverable?: {
    name: string;
    size: number;
    url?: string;
  };
  paymentProofUrl?: string;
  start_date?: string;
  end_date?: string;
}

export interface MilestoneCardProps {
  milestone: Milestone;
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  isClient?: boolean;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onDeliverableDownload?: (milestoneId: string) => void;
  currency?: import('@/lib/currency').CurrencyCode;
  freelancerCurrency?: import('@/lib/currency').CurrencyCode;
}
