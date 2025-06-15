
export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  created_at: string;
  updated_at: string;
  client_access_token: string;
  client_email?: string;
  milestones: DatabaseMilestone[];
}

export interface DatabaseMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  deliverable_name?: string;
  deliverable_url?: string;
  deliverable_size?: number;
  payment_proof_url?: string;
  watermark_text?: string;
}
