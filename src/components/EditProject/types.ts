
export interface MilestoneFormData {
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  deliverable_link?: string; // Can now store JSON array of links or single string for backward compatibility
}

export interface ProjectFormData {
  name: string;
  brief: string;
  clientEmail: string;
  paymentProofRequired: boolean;
  milestones: MilestoneFormData[];
}
