/**
 * Dynamic Brand Color System Utilities
 * Following Marc Lou's conversion-focused minimal design principles
 */

import { FreelancerBranding } from '@/types/branding';

// Default emerald green for conversion optimization
const DEFAULT_PRIMARY = '#10B981'; // emerald-500
const DEFAULT_SECONDARY = '#059669'; // emerald-600

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to HSL
 */
export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Convert HSL to RGB
 */
export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Calculate relative luminance for contrast checking
 */
export const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if color combination meets WCAG AA standard (4.5:1)
 */
export const meetsContrastStandard = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

/**
 * Generate lighter shade of a color
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + percent);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

/**
 * Generate darker shade of a color
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - percent);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

/**
 * Generate color variations for brand system
 */
export const generateBrandColorVariations = (primaryColor: string) => {
  const base = primaryColor || DEFAULT_PRIMARY;
  
  return {
    50: lightenColor(base, 45),   // Very light
    100: lightenColor(base, 35),  // Light
    200: lightenColor(base, 25),  // Light
    300: lightenColor(base, 15),  // Light medium
    400: lightenColor(base, 5),   // Medium
    500: base,                    // Base color
    600: darkenColor(base, 10),   // Medium dark
    700: darkenColor(base, 20),   // Dark
    800: darkenColor(base, 30),   // Very dark
    900: darkenColor(base, 40),   // Darkest
  };
};

/**
 * Get appropriate text color (white or black) for a background
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

/**
 * Generate complete brand color system
 */
export const generateBrandSystem = (branding?: FreelancerBranding | null) => {
  const primaryColor = branding?.primary_color || DEFAULT_PRIMARY;
  const secondaryColor = branding?.secondary_color || DEFAULT_SECONDARY;
  
  const primaryVariations = generateBrandColorVariations(primaryColor);
  const secondaryVariations = generateBrandColorVariations(secondaryColor);
  
  // Ensure contrast compliance for key combinations
  const primaryText = getContrastingTextColor(primaryColor);
  const secondaryText = getContrastingTextColor(secondaryColor);
  
  return {
    primary: {
      ...primaryVariations,
      DEFAULT: primaryColor,
      foreground: primaryText,
    },
    secondary: {
      ...secondaryVariations,
      DEFAULT: secondaryColor,
      foreground: secondaryText,
    },
    // Generate accent color (slightly adjusted primary)
    accent: {
      DEFAULT: lightenColor(primaryColor, 5),
      foreground: getContrastingTextColor(lightenColor(primaryColor, 5)),
    }
  };
};

/**
 * Generate CSS custom properties for brand colors
 */
export const generateBrandCSSVariables = (branding?: FreelancerBranding | null): Record<string, string> => {
  const brandSystem = generateBrandSystem(branding);
  const variables: Record<string, string> = {};
  
  // Convert colors to HSL for CSS custom properties (DaisyUI format)
  Object.entries(brandSystem.primary).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('#')) {
      const rgb = hexToRgb(value);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (key === 'DEFAULT') {
          variables['--p'] = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
        } else if (key === 'foreground') {
          variables['--pc'] = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
        }
      }
    }
  });
  
  // Secondary color
  Object.entries(brandSystem.secondary).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('#')) {
      const rgb = hexToRgb(value);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (key === 'DEFAULT') {
          variables['--s'] = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
        } else if (key === 'foreground') {
          variables['--sc'] = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
        }
      }
    }
  });
  
  // Accent color
  Object.entries(brandSystem.accent).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('#')) {
      const rgb = hexToRgb(value);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (key === 'DEFAULT') {
          variables['--a'] = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
        } else if (key === 'foreground') {
          variables['--ac'] = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
        }
      }
    }
  });
  
  return variables;
};

/**
 * Apply brand colors to document root
 */
export const applyBrandColorsToDOM = (branding?: FreelancerBranding | null): void => {
  const variables = generateBrandCSSVariables(branding);
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Add transition for smooth color changes
  if (!root.style.transition.includes('color')) {
    root.style.transition = `${root.style.transition} color 300ms ease, background-color 300ms ease`.trim();
  }
};

/**
 * Get initials from business name for fallback logo
 */
export const getBusinessInitials = (businessName?: string): string => {
  if (!businessName) return 'FL'; // Freelancer default
  
  return businessName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};