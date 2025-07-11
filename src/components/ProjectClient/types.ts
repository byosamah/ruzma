
export interface Milestone {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'in_progress' | 'under_review' | 'revision_requested' | 'payment_submitted' | 'approved' | 'rejected' | 'completed' | 'on_hold' | 'cancelled';
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
