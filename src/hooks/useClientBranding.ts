
import { useState, useEffect, useCallback } from 'react';
import { FreelancerBranding, defaultBranding } from '@/types/branding';
import { supabase } from '@/integrations/supabase/client';

export const useClientBranding = (freelancerUserId?: string) => {
  const [branding, setBranding] = useState<FreelancerBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    if (!freelancerUserId) return;

    try {
      const { data, error } = await supabase
        .from('freelancer_branding')
        .select('user_id, freelancer_name, freelancer_title, freelancer_bio, primary_color, secondary_color, logo_url')
        .eq('user_id', freelancerUserId)
        .maybeSingle();

      if (error) {
        // Continue with defaults if error occurs
      }

      if (data) {
        setBranding(data);
      } else {
        // No branding found, use defaults
        setBranding({
          user_id: freelancerUserId,
          ...defaultBranding,
          freelancer_name: 'Freelancer',
          freelancer_title: 'Professional',
          freelancer_bio: 'Delivering quality work for your projects.',
        } as FreelancerBranding);
      }
    } catch (error) {
      // Continue with defaults if error occurs
    } finally {
      setIsLoading(false);
    }
  }, [freelancerUserId]);

  useEffect(() => {
    if (!freelancerUserId) {
      setIsLoading(false);
      return;
    }

    fetchBranding();
  }, [freelancerUserId, fetchBranding]);

  return {
    branding,
    isLoading,
  };
};
