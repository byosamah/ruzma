
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
      className="relative overflow-hidden bg-white shadow-sm"
    >
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600">
                {t('clientProjectPortal')}
              </span>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Freelancer Brand Section */}
      <div 
        className="relative"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}08 100%)` 
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-6">
            
            {/* Logo */}
            <div className="flex justify-center">
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-lg flex items-center justify-center"
                style={{ backgroundColor: 'white' }}
              >
                {branding?.logo_url ? (
                  <img
                    src={branding.logo_url}
                    alt={branding.freelancer_name || 'Freelancer Logo'}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
                  />
                ) : (
                  <User 
                    className="w-10 h-10 sm:w-12 sm:h-12" 
                    style={{ color: primaryColor }} 
                  />
                )}
              </div>
            </div>

            {/* Freelancer Info */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                {branding?.freelancer_name || 'Professional Freelancer'}
              </h1>
              
              {branding?.freelancer_title && (
                <div className="flex justify-center">
                  <span 
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor 
                    }}
                  >
                    {branding.freelancer_title}
                  </span>
                </div>
              )}
              
              {branding?.freelancer_bio && (
                <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                  {branding.freelancer_bio}
                </p>
              )}
            </div>

            {/* Subtitle */}
            <div className="pt-4">
              <p className="text-slate-500 text-base">
                {t('trackProjectProgressAndMakePayments')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandedClientHeader;
