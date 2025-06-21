
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';

export const useNavigationActions = (setMobileMenuOpen: Dispatch<SetStateAction<boolean>>) => {
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
