
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Briefcase, Settings } from 'lucide-react';

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
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
    navigate('/');
  };
  return <div className="min-h-screen bg-background">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-7" />
            </Link>

            <div className="flex items-center space-x-4">
              {user ? <>
                  <Link to="/dashboard">
                    <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm" className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant={isActive('/profile') ? 'default' : 'ghost'} size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </> : <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">Sign Up</Button>
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
