/**
 * Branding System Hook
 * Manages dynamic CSS injection and brand color application
 */

import { useEffect } from 'react';
import { FreelancerBranding } from '@/types/branding';
import { applyBrandColorsToDOM, generateBrandSystem } from '@/lib/utils/brandingUtils';

export const useBrandingSystem = (branding?: FreelancerBranding | null) => {
  // Apply brand colors to DOM when branding changes
  useEffect(() => {
    if (branding) {
      applyBrandColorsToDOM(branding);
    }
    
    // Cleanup function to reset to default colors if branding is removed
    return () => {
      if (!branding) {
        applyBrandColorsToDOM(null);
      }
    };
  }, [branding]);

  // Generate brand system for components to use
  const brandSystem = generateBrandSystem(branding);
  
  return {
    brandSystem,
    primaryColor: branding?.primary_color || '#10B981',
    secondaryColor: branding?.secondary_color || '#059669',
    hasCustomBranding: !!branding?.primary_color,
  };
};

/**
 * Hook for getting brand-aware styles
 */
export const useBrandStyles = (branding?: FreelancerBranding | null) => {
  const { brandSystem, primaryColor, hasCustomBranding } = useBrandingSystem(branding);
  
  // Generate dynamic styles that can be used in className or style props
  const styles = {
    // Primary button styles
    primaryButton: hasCustomBranding 
      ? `bg-[${primaryColor}] hover:bg-[${brandSystem.primary[600]}] text-[${brandSystem.primary.foreground}]`
      : 'btn-primary',
    
    // Primary text color
    primaryText: hasCustomBranding 
      ? `text-[${primaryColor}]`
      : 'text-primary',
    
    // Primary background
    primaryBg: hasCustomBranding 
      ? `bg-[${primaryColor}]`
      : 'bg-primary',
    
    // Light primary background
    primaryBgLight: hasCustomBranding 
      ? `bg-[${brandSystem.primary[50]}]`
      : 'bg-primary/10',
    
    // Primary border
    primaryBorder: hasCustomBranding 
      ? `border-[${primaryColor}]`
      : 'border-primary',
    
    // Progress indicator colors
    progressStroke: hasCustomBranding 
      ? primaryColor
      : '#10B981',
  };
  
  return styles;
};