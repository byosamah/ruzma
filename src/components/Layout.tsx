
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Briefcase, TrendingUp } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import LanguageSelector from './LanguageSelector';

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
  const isActive = (path: string) => location.pathname === path;
  const isLandingPage = location.pathname === '/';
  const t = useT();
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
    navigate('/');
  };
  const LogoComponent = () => {
    if (user && !isLandingPage) {
      // Clickable logo for authenticated users not on landing page
      return <Link to="/dashboard" className="flex items-center">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-7" />
        </Link>;
    } else {
      // Non-clickable logo for landing page or non-authenticated users
      return <div className="flex items-center">
          <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-7" />
        </div>;
    }
  };
  return <div className="min-h-screen bg-auth-background">
      <nav className="bg-background text-foreground border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <LogoComponent />
            <div className="flex items-center space-x-4">
              {user && (
                <Link to="/plans">
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </Link>
              )}
              <LanguageSelector />
              {user ? <>
                  <Link to="/dashboard">
                    <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} size="sm">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {t("dashboard")}
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant={isActive('/profile') ? 'secondary' : 'ghost'} size="icon">
                      <User className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("signOut")}</p>
                    </TooltipContent>
                  </Tooltip>
                </> : <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">{t("login")}</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" variant="secondary">{t("signUp")}</Button>
                  </Link>
                </>}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>;
};

export default Layout;
