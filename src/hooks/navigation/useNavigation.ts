
import { User } from '@supabase/supabase-js';
import { useNavigationState } from './useNavigationState';
import { useNavigationActions } from './useNavigationActions';

export const useNavigation = (user: User | null) => {
  const navigationState = useNavigationState(user);
  const navigationActions = useNavigationActions(navigationState.setMobileMenuOpen);

  return {
    ...navigationState,
    ...navigationActions
  };
};
