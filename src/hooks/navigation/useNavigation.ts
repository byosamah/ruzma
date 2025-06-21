
import { useNavigationState } from './useNavigationState';
import { useNavigationActions } from './useNavigationActions';

export const useNavigation = (user: any) => {
  const navigationState = useNavigationState(user);
  const navigationActions = useNavigationActions(navigationState.setMobileMenuOpen);

  return {
    ...navigationState,
    ...navigationActions
  };
};
