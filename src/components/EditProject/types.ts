
export interface MilestoneFormData {
  id?: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
}
