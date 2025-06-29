
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

const AuthToggle = () => {
  const t = useT();

  return (
    <div className="flex bg-gray-50 rounded-lg p-1">
      <Button 
        variant="ghost" 
        className="flex-1 bg-white shadow-sm text-gray-900 font-medium hover:bg-white text-sm sm:text-base h-9 sm:h-10"
      >
        {t('signIn')}
      </Button>
      <Button 
        asChild 
        variant="ghost" 
        className="flex-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-medium text-sm sm:text-base h-9 sm:h-10"
      >
        <Link to="/signup">{t('signUp')}</Link>
      </Button>
    </div>
  );
};

export default AuthToggle;
