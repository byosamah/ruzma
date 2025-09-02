
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ProfileFormData } from '@/hooks/profile/types';

export const profileService = {
  async fetchProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, currency, user_type, project_count, storage_used, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    return { profile, error };
  },

  async createProfile(user: User, userCurrency: string) {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        currency: userCurrency
      })
      .select()
      .single();

    return { profile: newProfile, error: createError };
  },

  async updateProfile(userId: string, formData: ProfileFormData) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.name,
        email: formData.email,
        company: formData.company,
        website: formData.website,
        bio: formData.bio,
        currency: formData.currency,
        country: formData.country,
      })
      .eq('id', userId);

    return { error };
  }
};
