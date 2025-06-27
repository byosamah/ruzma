
import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18n';

const LoginHeader = () => {
  const t = useT();

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <Link to="/">
          <img 
            src="/lovable-uploads/d7c62fd0-8ad6-4696-b936-c40ca12c9886.png" 
            alt="Ruzma" 
            className="h-10 object-contain" 
          />
        </Link>
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-gray-900">{t('loginWelcome')}</h1>
        <p className="text-gray-600">{t('loginSubtitle')}</p>
      </div>
    </div>
  );
};

export default LoginHeader;
