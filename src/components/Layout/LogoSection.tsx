
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoSectionProps {
  user?: any;
  isLandingPage: boolean;
}

const LogoSection: React.FC<LogoSectionProps> = ({ user, isLandingPage }) => {
  if (user && !isLandingPage) {
    return (
      <Link to="/dashboard" className="flex items-center">
        <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-7" />
      </Link>
    );
  } else {
    return (
      <div className="flex items-center">
        <img src="/lovable-uploads/bca9fbc0-5ee9-455b-91b3-b7eff1f56169.png" alt="Ruzma Logo" className="h-7" />
      </div>
    );
  }
};

export default LogoSection;
