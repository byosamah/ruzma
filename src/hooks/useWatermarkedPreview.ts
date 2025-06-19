
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWatermarkedPreview = () => {
  const [loading, setLoading] = useState(false);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);

  const generateWatermarkedPreview = async (
    originalUrl: string,
    watermarkText: string,
    fileType: string
  ): Promise<string | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-watermarked-preview', {
        body: {
          fileUrl: originalUrl,
          watermarkText,
          fileType
        }
      });

      if (error) {
        console.error('Error generating watermarked preview:', error);
        toast.error('Failed to generate secure preview');
        return null;
      }

      if (data?.watermarkedUrl) {
        setWatermarkedUrl(data.watermarkedUrl);
        return data.watermarkedUrl;
      }

      return null;
    } catch (error) {
      console.error('Error generating watermarked preview:', error);
      toast.error('Failed to generate secure preview');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    watermarkedUrl,
    generateWatermarkedPreview,
  };
};
