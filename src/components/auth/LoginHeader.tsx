
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18n';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';

const LoginHeader = () => {
  const t = useT();
  const { getPathWithLanguage } = useLanguageNavigation();

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <Link to={getPathWithLanguage('/')}>
          <img 
            src="/assets/logo-full-en.svg" 
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
