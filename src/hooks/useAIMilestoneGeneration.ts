
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

export interface AIGeneratedMilestone {
  title: string;
  description: string;
  price: number;
  start_date: string;
  end_date: string;
}

export interface AIGenerationResult {
  suggestedName: string;
  milestones: AIGeneratedMilestone[];
}

export const useAIMilestoneGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useT();
  const { language } = useLanguage();

  const generateMilestones = async (brief: string): Promise<AIGenerationResult | null> => {
    if (!brief || brief.length < 10) {
      toast.error(t('briefTooShort'));
      return null;
    }

    setIsGenerating(true);
    try {
      console.log('Generating milestones for brief:', brief.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('generate-project-milestones', {
        body: { 
          brief: brief.trim(),
          language 
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        
        // Handle specific error types
        if (error.message?.includes('OpenAI API authentication failed')) {
          toast.error('OpenAI API key is invalid. Please check your API key configuration.');
          return null;
        } else if (error.message?.includes('rate limit')) {
          toast.error('OpenAI API rate limit exceeded. Please try again later.');
          return null;
        } else if (error.message?.includes('not configured')) {
          toast.error('OpenAI API key is not configured. Please contact support.');
          return null;
        }
        
        throw new Error(error.message || 'Failed to generate milestones');
      }

      if (!data) {
        throw new Error('No data received from AI service');
      }

      // Handle error responses from the edge function
      if (data.error) {
        console.error('Edge function error:', data.error, data.details);
        
        if (data.error.includes('authentication failed')) {
          toast.error('OpenAI API key is invalid. Please check your API key configuration.');
        } else if (data.error.includes('rate limit')) {
          toast.error('OpenAI API rate limit exceeded. Please try again later.');
        } else if (data.error.includes('not configured')) {
          toast.error('AI service is not properly configured. Please contact support.');
        } else {
          toast.error(data.details || data.error || 'Failed to generate milestones');
        }
        return null;
      }

      console.log('AI Generation successful:', data);
      toast.success(t('milestonesGeneratedSuccessfully'));
      
      return data as AIGenerationResult;
    } catch (error) {
      console.error('Error generating milestones:', error);
      toast.error(error instanceof Error ? error.message : t('failedToGenerateMilestones'));
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMilestones,
    isGenerating,
  };
};
