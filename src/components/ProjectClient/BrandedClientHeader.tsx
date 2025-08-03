
import React from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import { FreelancerBranding } from '@/types/branding';
import { User } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface BrandedClientHeaderProps {
  branding?: FreelancerBranding | null;
}

const BrandedClientHeader: React.FC<BrandedClientHeaderProps> = ({ branding }) => {
  const t = useT();

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Top Navigation Bar */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="text-sm text-gray-600">
              {t('clientProjectPortal')}
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
      
      {/* Freelancer Branding Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* Logo/Avatar */}
          <div className="flex-shrink-0">
            {branding?.logo_url ? (
              <img
                src={branding.logo_url}
                alt={`${branding.freelancer_name || 'Freelancer'} logo`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Freelancer Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-medium text-gray-900 truncate">
              {branding?.freelancer_name || 'Professional Freelancer'}
            </h1>
            {branding?.freelancer_title && (
              <p className="text-sm text-gray-600 mt-1">
                {branding.freelancer_title}
              </p>
            )}
            {branding?.freelancer_bio && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {branding.freelancer_bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandedClientHeader;
