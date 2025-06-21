
import { useNavigate } from 'react-router-dom';

export const useNavigationActions = (setMobileMenuOpen: (open: boolean) => void) => {
  const navigate = useNavigate();

  const handleSignOut = (onSignOut?: () => void) => {
    if (onSignOut) {
      onSignOut();
    }
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return {
    handleSignOut,
    toggleMobileMenu
  };
};
