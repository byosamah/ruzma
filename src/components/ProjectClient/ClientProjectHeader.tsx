
import React from 'react';
import { Briefcase } from 'lucide-react';
import { useT } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { useIsMobile } from '@/hooks/use-mobile';

const ClientProjectHeader: React.FC = () => {
  const t = useT();
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-slate-800`}>
                {t('clientProjectPortal')}
              </h1>
              {!isMobile && (
                <p className="text-slate-600 text-sm">{t('trackProjectProgressAndMakePayments')}</p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <LanguageSelector />
          </div>
        </div>
        {isMobile && (
          <p className="text-slate-600 text-sm mt-2">{t('trackProjectProgressAndMakePayments')}</p>
        )}
      </div>
    </div>
  );
};

export default ClientProjectHeader;
