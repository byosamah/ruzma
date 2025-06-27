
import React from 'react';
import { User, Briefcase } from 'lucide-react';
import { useT } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { FreelancerBranding } from '@/types/branding';

interface BrandedClientHeaderProps {
  branding: FreelancerBranding | null;
}

const BrandedClientHeader: React.FC<BrandedClientHeaderProps> = ({
  branding
}) => {
  const t = useT();
  const isMobile = useIsMobile();
  const primaryColor = branding?.primary_color || '#4B72E5';

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Top Navigation Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-5 h-5 rounded flex items-center justify-center" 
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Briefcase className="w-3 h-3" style={{ color: primaryColor }} />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {t('clientProjectPortal')}
            </span>
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Freelancer Brand Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div 
              className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center"
            >
              {branding?.logo_url ? (
                <img 
                  src={branding.logo_url} 
                  alt={branding.freelancer_name || 'Freelancer Logo'} 
                  className="w-10 h-10 object-contain rounded-md" 
                />
              ) : (
                <User 
                  className="w-6 h-6 text-gray-400" 
                />
              )}
            </div>
          </div>

          {/* Freelancer Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {branding?.freelancer_name || 'Professional Freelancer'}
            </h1>
            
            {branding?.freelancer_title && (
              <p className="text-sm text-gray-500 mt-1">
                {branding.freelancer_title}
              </p>
            )}
          </div>
        </div>

        {branding?.freelancer_bio && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {branding.freelancer_bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandedClientHeader;
