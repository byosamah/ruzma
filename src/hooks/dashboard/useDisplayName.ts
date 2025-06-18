
import { useMemo } from 'react';
import { User } from '@supabase/supabase-js';

export const useDisplayName = (profile: any, user: User | null) => {
  const displayName = useMemo(() =>
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User", [profile, user]);

  return displayName;
};
