
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logSecurityEvent } from '@/lib/authSecurity';
import { ProfileFormData } from '../types';

export const fetchExistingProfile = async (userId: string) => {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { profileData, profileError };
};

export const createNewProfile = async (user: User, userCurrency: string) => {
  console.log('Profile: Creating new profile...');
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
    console.error("Profile: Profile creation failed:", createError);
    logSecurityEvent('profile_creation_failed', { error: createError.message });
    toast.error("Profile setup error");
  } else {
    console.log('Profile: New profile created');
    logSecurityEvent('profile_created', { userId: user.id });
  }

  return { newProfile, createError };
};

export const setProfileFormData = (
  profile: any, 
  branding: any, 
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
