
export interface DatabaseMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'in_progress' | 'under_review' | 'revision_requested' | 'payment_submitted' | 'approved' | 'rejected' | 'completed' | 'on_hold' | 'cancelled';
  deliverable_name?: string;
  deliverable_url?: string;
  deliverable_size?: number;
  deliverable_link?: string;
  payment_proof_url?: string;
  watermark_text?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProject {
  id: string;
  slug: string;
  user_id: string;
  name: string;
  brief: string;
  client_email?: string;
  start_date?: string;
  end_date?: string;
  client_access_token: string;
  payment_proof_required?: boolean;
  created_at: string;
  updated_at: string;
  milestones: DatabaseMilestone[];
  freelancer_currency?: string;
  currency?: string;
}
