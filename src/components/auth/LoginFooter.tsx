
import React from 'react';
import { useT } from '@/lib/i18n';

const LoginFooter = () => {
  const t = useT();

  return (
    <div className="text-center text-xs text-gray-500">
      {t('footerRights', { year: new Date().getFullYear().toString() })}
    </div>
  );
};

export default LoginFooter;
