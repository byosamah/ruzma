/**
 * Branded Logo Component
 * Displays freelancer logo with intelligent fallback system
 * Following Marc Lou's conversion-focused design principles
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';
import { FreelancerBranding } from '@/types/branding';
import { getBusinessInitials } from '@/lib/utils/brandingUtils';
import { useBrandStyles } from '@/hooks/useBrandingSystem';
import { cn } from '@/lib/utils';

interface BrandedLogoProps {
  branding?: FreelancerBranding | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
  fallbackIcon?: 'star' | 'user';
}

const BrandedLogo: React.FC<BrandedLogoProps> = ({
  branding,
  size = 'md',
  className,
  showName = false,
  fallbackIcon = 'star'
}) => {
  const [imageError, setImageError] = useState(false);
  const styles = useBrandStyles(branding);
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      image: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs font-medium',
      nameText: 'text-sm font-medium'
    },
    md: {
      container: 'w-10 h-10',
      image: 'w-10 h-10', 
      icon: 'w-5 h-5',
      text: 'text-sm font-semibold',
      nameText: 'text-base font-semibold'
    },
    lg: {
      container: 'w-12 h-12',
      image: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base font-bold',
      nameText: 'text-lg font-bold'
    }
  };
  
  const config = sizeConfig[size];
  const businessName = branding?.business_name || branding?.freelancer_name;
  const initials = getBusinessInitials(businessName);
  
  // Logo content based on availability and error state
  const renderLogoContent = () => {
    // If logo URL exists and no error, show image
    if (branding?.logo_url && !imageError) {
      return (
        <img
          src={branding.logo_url}
          alt={businessName || 'Logo'}
          className={cn(
            config.image,
            'rounded-full object-cover ring-2 ring-white/20'
          )}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      );
    }
    
    // Fallback to initials if business name exists
    if (businessName && initials !== 'FL') {
      return (
        <div className={cn(
          config.container,
          'rounded-full flex items-center justify-center text-white font-bold',
          branding?.primary_color 
            ? `bg-[${branding.primary_color}]`
            : 'bg-primary'
        )}>
          <span className={config.text}>
            {initials}
          </span>
        </div>
      );
    }
    
    // Final fallback to icon
    const IconComponent = fallbackIcon === 'star' ? Star : User;
    return (
      <div className={cn(
        config.container,
        'rounded-full flex items-center justify-center',
        branding?.primary_color 
          ? `bg-[${branding.primary_color}]/10 text-[${branding.primary_color}]`
          : 'bg-primary/10 text-primary'
      )}>
        <IconComponent className={config.icon} />
      </div>
    );
  };
  
  return (
    <motion.div 
      className={cn(
        'flex items-center space-x-3',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {renderLogoContent()}
      
      {showName && businessName && (
        <div className="min-w-0 flex-1">
          <h1 className={cn(
            config.nameText,
            'text-gray-900 truncate'
          )}>
            {businessName}
          </h1>
          {branding?.freelancer_title && (
            <p className="text-xs text-gray-600 truncate">
              {branding.freelancer_title}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BrandedLogo;