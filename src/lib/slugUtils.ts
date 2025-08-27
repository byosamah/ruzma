
import { supabase } from '@/integrations/supabase/client';

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
};

export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const ensureUniqueSlug = async (baseSlug: string, userId: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking slug uniqueness:', error);
      return slug;
    }
    
      if (!data?.length) {
        return slug;
      }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
