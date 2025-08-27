// Profile-related TypeScript interfaces

import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  currency?: string;
  user_type?: string;
  subscription_status?: string;
  subscription_id?: string;
  created_at?: string;
  updated_at?: string;
  company?: string;
  website?: string;
  bio?: string;
  country?: string;
  professional_title?: string;
  short_bio?: string;
  primary_color?: string;
  logo_url?: string;
  project_count?: number;
  storage_used?: number;
  [key: string]: unknown;
}

// Re-export Supabase User type for compatibility
export type AuthenticatedUser = User;