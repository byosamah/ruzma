
// Shared types used across the application
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
  created_at: string;
  updated_at: string;
  milestones: DatabaseMilestone[];
  freelancer_currency?: string;
  currency?: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  company?: string;
  website?: string;
  bio?: string;
  currency?: string;
  user_type?: string;
  subscription_status?: string;
  subscription_id?: string;
  project_count?: number;
  storage_used?: number;
  notification_settings?: {
    marketing: boolean;
    projectUpdates: boolean;
    milestoneUpdates: boolean;
    paymentReminders: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface BrandingData {
  id: string;
  user_id: string;
  freelancer_name: string;
  freelancer_title: string;
  freelancer_bio: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form data types
export interface CreateProjectData {
  name: string;
  brief: string;
  client_email?: string;
  start_date?: string;
  end_date?: string;
  payment_proof_required: boolean;
  milestones: Omit<DatabaseMilestone, 'id' | 'project_id' | 'created_at' | 'updated_at'>[];
}
