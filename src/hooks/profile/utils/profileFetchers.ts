
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';
import { ProfileFormData } from '../types';

interface DatabaseProfile {
  id: string;
  full_name?: string;
  email?: string;
  company?: string;
  website?: string;
  bio?: string;
  currency?: string;
  country?: string;
  [key: string]: unknown;
}

interface BrandingData {
  freelancer_title?: string;
  freelancer_bio?: string;
  primary_color?: string;
  logo_url?: string;
  [key: string]: unknown;
}

export const fetchExistingProfile = async (userId: string) => {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { profileData, profileError };
};

export const createNewProfile = async (user: User, userCurrency: string) => {
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email
    })
    .select()
    .single();
    
  if (createError) {
    logSecurityEvent('profile_creation_failed', { error: createError.message });
    toast.error("Profile setup error");
  } else {
    logSecurityEvent('profile_created', { userId: user.id });
  }

  return { newProfile, createError };
};

export const setProfileFormData = (
  profile: DatabaseProfile | null, 
  branding: BrandingData | null, 
  user: User, 
  userCurrency?: string
): ProfileFormData => {
  const signupName = user.user_metadata?.full_name || user.user_metadata?.name || '';
  
  return {
    name: profile?.full_name || signupName,
    email: profile?.email || user.email || '',
    company: profile?.company || '',
    website: profile?.website || '',
    bio: profile?.bio || '',
    currency: profile?.currency || userCurrency || 'USD',
    country: profile?.country || user.user_metadata?.country || '',
    professionalTitle: branding?.freelancer_title || '',
    shortBio: branding?.freelancer_bio || '',
    primaryColor: branding?.primary_color || '#050c1e',
    logoUrl: branding?.logo_url || ''
  };
};
