
export interface Milestone {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  deliverable?: {
    url?: string;
    name?: string;
    size?: number;
  };
  deliverable_link?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}
