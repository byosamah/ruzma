/**
 * Common TypeScript interfaces to replace any types throughout the application
 */

// Error handling interfaces
export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  cause?: unknown;
}

// Milestone interface for revision utilities (optional deliverable_link for compatibility)
export interface MilestoneData {
  id: string;
  deliverable_link?: string | null;
  title: string;
  description?: string;
  price?: number;
  status?: string;
  [key: string]: unknown; // Allow additional properties for flexibility
}

// Analytics interfaces
export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  quantity?: number;
  price?: number;
  currency?: string;
}

export interface GTAGArgs {
  [key: string]: string | number | boolean | AnalyticsItem[];
}

// Request/Response interfaces
export interface RequestData {
  [key: string]: unknown;
}

export interface ResponseData {
  [key: string]: unknown;
}

// Generic form data interface
export interface FormData {
  [key: string]: string | number | boolean | File | null | undefined;
}

// User profile interface extending Supabase User
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  website?: string;
  bio?: string;
  currency?: string;
  user_type?: string;
  project_count?: number;
  storage_used?: number;
  [key: string]: unknown;
}

// Project milestone interface
export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: string;
  deliverable_link?: string | null;
  payment_proof_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  [key: string]: unknown;
}

// Parsed JSON data interface
export interface ParsedJSONData {
  [key: string]: unknown;
}

// Generic API response interface
export interface APIResponse<T = ResponseData> {
  data?: T;
  error?: AppError;
  success: boolean;
}