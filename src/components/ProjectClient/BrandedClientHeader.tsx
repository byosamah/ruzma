
import React from 'react';
import { User, Briefcase } from 'lucide-react';
import { useT } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { FreelancerBranding } from '@/types/branding';

interface BrandedClientHeaderProps {
  branding: FreelancerBranding | null;
}

const BrandedClientHeader: React.FC<BrandedClientHeaderProps> = ({ branding }) => {
  const t = useT();
  const isMobile = useIsMobile();
  
  const primaryColor = branding?.primary_color || '#4B72E5';
  const secondaryColor = branding?.secondary_color || '#1D3770';
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative z-10">
        {/* Header Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
                  {t('clientProjectPortal')}
                </h1>
                {!isMobile && (
                  <p className="text-white/80 text-sm">{t('trackProjectProgressAndMakePayments')}</p>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <LanguageSelector />
            </div>
          </div>
          {isMobile && (
            <p className="text-white/80 text-sm mt-2">{t('trackProjectProgressAndMakePayments')}</p>
          )}
        </div>

        {/* Freelancer Info Section */}
        {branding && (branding.freelancer_name || branding.logo_url) && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  {branding.logo_url ? (
                    <img
                      src={branding.logo_url}
                      alt={branding.freelancer_name || 'Freelancer Logo'}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <User className="w-8 h-8" style={{ color: primaryColor }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white">
                    {branding.freelancer_name || 'Professional Freelancer'}
                  </h2>
                  {branding.freelancer_title && (
                    <p className="text-white/90 font-medium">
                      {branding.freelancer_title}
                    </p>
                  )}
                  {branding.freelancer_bio && (
                    <p className="text-white/70 text-sm mt-1">
                      {branding.freelancer_bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandedClientHeader;
