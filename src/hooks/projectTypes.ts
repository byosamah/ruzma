
export interface DatabaseMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  deliverable_name?: string;
  deliverable_url?: string;
  deliverable_size?: number;
  deliverable_link?: string; // Can now store JSON array of links or single string for backward compatibility
  payment_proof_url?: string;
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
  contract_status?: 'pending' | 'approved' | 'rejected';
  contract_sent_at?: string;
  contract_approved_at?: string;
  contract_rejection_reason?: string;
  contract_approval_token?: string;
  contract_terms?: string;
  payment_terms?: string;
  project_scope?: string;
  revision_policy?: string;
  created_at: string;
  updated_at: string;
  milestones: DatabaseMilestone[];
  freelancer_currency?: string;
  currency?: string;
}
