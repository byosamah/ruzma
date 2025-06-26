
import { User } from '@supabase/supabase-js';
import { useProjectCRUD } from './projects/useProjectCRUD';

export const useProjectActions = (user: User | null) => {
  return useProjectCRUD(user);
};
