
export interface ProjectTemplate {
  id: string;
  name: string;
  brief: string;
  contract_required?: boolean;
  payment_proof_required?: boolean;
  contract_terms?: string;
  payment_terms?: string;
  project_scope?: string;
  revision_policy?: string;
  milestones: {
    title: string;
    description: string;
    price: number;
    start_date: string;
    end_date: string;
  }[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
