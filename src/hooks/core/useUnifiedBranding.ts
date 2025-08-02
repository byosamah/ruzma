import { useState, useEffect } from 'react';
import { FreelancerBranding, BrandingFormData, defaultBranding } from '@/types/branding';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureFileUpload } from '@/lib/storageeSecurity';
import { useDataFetcher } from './useDataFetcher';
import { ErrorHandler } from '@/services/core/ErrorHandler';

export interface UseBrandingOptions {
  user?: User | null;
  userId?: string;
  isClient?: boolean;
  enableEdit?: boolean;
}

export const useUnifiedBranding = (options: UseBrandingOptions = {}) => {
  const { user, userId, isClient = false, enableEdit = false } = options;
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine the user ID to use
  const targetUserId = userId || user?.id;
  
  // Use the generic data fetcher
  const {
    data: branding,
    loading: isLoading,
    error,
    refetch
  } = useDataFetcher<FreelancerBranding | null>({
    fetchFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('freelancer_branding')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        return data;
      }

      // Return default branding if none exists
      const defaultData: FreelancerBranding = {
        user_id: targetUserId,
        ...defaultBranding,
        freelancer_name: isClient ? 'Freelancer' : (user?.user_metadata?.full_name || ''),
        freelancer_title: 'Professional',
        freelancer_bio: 'Delivering quality work for your projects.',
        primary_color: '#050c1e',
      } as FreelancerBranding;

      return defaultData;
    },
    dependencies: [targetUserId],
    requireAuth: !isClient,
    enabled: !!targetUserId,
    cacheKey: `branding-${targetUserId}`,
    onError: (error) => {
      console.error('Error fetching branding:', error);
      if (!isClient) {
        toast.error('Failed to load branding settings');
      }
    }
  });

  const saveBranding = async (formData: BrandingFormData): Promise<boolean> => {
    if (!user || !enableEdit || isClient) return false;

    setIsSaving(true);
    try {
      const brandingData = {
        user_id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('freelancer_branding')
        .upsert(brandingData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Branding settings saved successfully!');
      await refetch(); // Refresh the data
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'useUnifiedBranding.saveBranding');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user || !enableEdit || isClient) return null;

    try {
      const result = await secureFileUpload(
        file,
        'branding-logos',
        user.id,
        user.id
      );

      if (result.success && result.url) {
        return result.url;
      } else {
        toast.error(result.error || 'Failed to upload logo');
        return null;
      }
    } catch (error) {
      ErrorHandler.handle(error, 'useUnifiedBranding.uploadLogo');
      return null;
    }
  };

  return {
    branding,
    isLoading,
    isSaving,
    error,
    saveBranding: enableEdit ? saveBranding : undefined,
    uploadLogo: enableEdit ? uploadLogo : undefined,
    refetch,
  };
};

// Backward compatibility exports
export const useBranding = (user: User | null) => {
  return useUnifiedBranding({ user, enableEdit: true });
};

export const useClientBranding = (freelancerUserId?: string) => {
  return useUnifiedBranding({ userId: freelancerUserId, isClient: true });
};