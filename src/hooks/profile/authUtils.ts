
import { supabase } from '@/integrations/supabase/client';

export const handleSignOut = async (navigate: (path: string) => void) => {
  await supabase.auth.signOut();
  navigate('/');
};
