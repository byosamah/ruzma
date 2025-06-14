
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Briefcase, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-gradient">
      <nav className="bg-white/90 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-blue to-brand-yellow rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-brand-navy">Ruzma</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button 
                      variant={isActive('/dashboard') ? 'default' : 'ghost'} 
                      size="sm"
                      className={isActive('/dashboard') 
                        ? "flex items-center space-x-2 bg-brand-blue hover:bg-brand-blue-dark text-white" 
                        : "flex items-center space-x-2 text-brand-navy hover:bg-white/20"
                      }
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button 
                      variant={isActive('/profile') ? 'default' : 'ghost'} 
                      size="sm"
                      className={isActive('/profile') 
                        ? "flex items-center space-x-2 bg-brand-blue hover:bg-brand-blue-dark text-white" 
                        : "flex items-center space-x-2 text-brand-navy hover:bg-white/20"
                      }
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-white/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-brand-navy hover:bg-white/20">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
