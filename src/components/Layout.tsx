
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import FloatingContactButton from './FloatingContactButton';
import LogoSection from './Layout/LogoSection';
import NavigationMenu from './Layout/NavigationMenu';
import MobileMenu from './Layout/MobileMenu';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  onSignOut
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (!error) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
    navigate('/');
    setMobileMenuOpen(false);
  };

  const shouldShowUpgradeButton = user && userProfile?.user_type !== 'pro';

  return (
    <div className="min-h-screen bg-auth-background">
      <nav className="bg-background text-foreground border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <LogoSection user={user} isLandingPage={isLandingPage} />
              <div className="hidden sm:block flex-shrink-0">
                <LanguageSelector className="border-0 shadow-none p-1" />
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
              <NavigationMenu
                user={user}
                userProfile={userProfile}
                isActive={isActive}
                isMobile={false}
                shouldShowUpgradeButton={shouldShowUpgradeButton}
                onSignOut={handleSignOut}
                onMenuClick={() => {}}
              />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="sm:hidden">
                <LanguageSelector className="border-0 shadow-none p-1 text-xs" />
              </div>
              <MobileMenu
                mobileMenuOpen={mobileMenuOpen}
                onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                user={user}
                userProfile={userProfile}
                isActive={isActive}
                shouldShowUpgradeButton={shouldShowUpgradeButton}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8">
        {children}
      </main>
      <FloatingContactButton />
    </div>
  );
};

export default Layout;
