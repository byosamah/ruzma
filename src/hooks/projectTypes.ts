
export interface DatabaseMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  start_date?: string;
  end_date?: string;
  deliverable_url?: string;
  deliverable_name?: string;
  deliverable_size?: number;
  payment_proof_url?: string;
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
