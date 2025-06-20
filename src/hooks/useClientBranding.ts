
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FreelancerBranding, defaultBranding } from '@/types/branding';

export const useClientBranding = (freelancerUserId?: string) => {
  const [branding, setBranding] = useState<FreelancerBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!freelancerUserId) {
      setIsLoading(false);
      return;
    }

    fetchBranding();
  }, [freelancerUserId]);

  const fetchBranding = async () => {
    if (!freelancerUserId) return;

    try {
      const { data, error } = await supabase
        .from('freelancer_branding')
        .select('*')
        .eq('user_id', freelancerUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching client branding:', error);
      }

      // Use default branding if none exists
      setBranding(data || {
        user_id: freelancerUserId,
        ...defaultBranding,
        freelancer_name: 'Freelancer',
        freelancer_title: 'Professional',
        freelancer_bio: 'Delivering quality work for your projects.',
      } as FreelancerBranding);
    } catch (error) {
      console.error('Error fetching client branding:', error);
      setBranding({
        user_id: freelancerUserId,
        ...defaultBranding,
        freelancer_name: 'Freelancer',
        freelancer_title: 'Professional', 
        freelancer_bio: 'Delivering quality work for your projects.',
      } as FreelancerBranding);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    branding,
    isLoading,
  };
};
