
import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div 
      className="bg-base-100 border-b border-base-300/50 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Minimal Top Bar */}
      <div className="bg-base-200/50 border-b border-base-300/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-10">
            <div className="badge badge-ghost badge-sm">
              {t('clientProjectPortal')}
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
      
      {/* Clean Freelancer Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Avatar with subtle animation */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {branding?.logo_url ? (
              <div className="avatar">
                <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={branding.logo_url}
                    alt={`${branding.freelancer_name || 'Freelancer'} logo`}
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-14 h-14">
                  <User className="w-6 h-6" />
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Freelancer Info - Clean Typography */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-1">
              {branding?.freelancer_name || 'Professional Freelancer'}
            </h1>
            {branding?.freelancer_title && (
              <div className="badge badge-outline badge-lg mb-2">
                {branding.freelancer_title}
              </div>
            )}
            {branding?.freelancer_bio && (
              <p className="text-base-content/70 text-sm sm:text-base max-w-2xl leading-relaxed">
                {branding.freelancer_bio}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BrandedClientHeader;
