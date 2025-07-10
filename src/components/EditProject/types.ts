export interface MilestoneFormData {
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  deliverable_link?: string; // New field for link sharing
}

export interface ProjectFormData {
  name: string;
  brief: string;
  clientEmail: string;
  paymentProofRequired: boolean;
  milestones: MilestoneFormData[];
}
