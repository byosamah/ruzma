export interface MilestoneFormData {
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'in_progress' | 'under_review' | 'revision_requested' | 'payment_submitted' | 'approved' | 'rejected' | 'completed' | 'on_hold' | 'cancelled';
  start_date?: string;
  end_date?: string;
  deliverable_link?: string;
}

export interface ProjectFormData {
  name: string;
  brief: string;
  clientEmail: string;
  paymentProofRequired: boolean;
  milestones: MilestoneFormData[];
}
