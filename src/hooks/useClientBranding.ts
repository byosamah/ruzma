
import { useState, useEffect } from 'react';
import { FreelancerBranding, defaultBranding } from '@/types/branding';

export const useClientBranding = (freelancerUserId?: string) => {
  const [branding, setBranding] = useState<FreelancerBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!freelancerUserId) {
      setIsLoading(false);
      return;
    }

    // For now, use default branding until database table is created
    setBranding({
      user_id: freelancerUserId,
      ...defaultBranding,
      freelancer_name: 'Freelancer',
      freelancer_title: 'Professional',
      freelancer_bio: 'Delivering quality work for your projects.',
    } as FreelancerBranding);
    setIsLoading(false);
  }, [freelancerUserId]);

  return {
    branding,
    isLoading,
  };
};
