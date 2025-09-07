
export interface FreelancerBranding {
  id?: string;
  user_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  freelancer_name: string;
  freelancer_title: string;
  freelancer_bio: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandingFormData {
  freelancer_name: string;
  freelancer_title: string;
  freelancer_bio: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
}

export const defaultBranding: Partial<FreelancerBranding> = {
  primary_color: '#f9fafb',
  secondary_color: '#1D3770',
  freelancer_name: '',
  freelancer_title: '',
  freelancer_bio: '',
};
