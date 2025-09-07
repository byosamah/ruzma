/**
 * Color utility functions for calculating contrast and determining optimal text colors
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate the relative luminance of a color
 * Based on WCAG guidelines: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG guidelines: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
function getContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determine if a color is light or dark based on its luminance
 */
export function isLightColor(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return true; // Default to light if invalid color
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5; // Threshold for determining light vs dark
}

/**
 * Get the best text color (black or white) for a given background color
 * Returns the color with the highest contrast ratio
 */
export function getBestTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#111827'; // Default to dark text if invalid color
  
  const whiteContrast = getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const blackContrast = getContrastRatio(rgb, { r: 17, g: 24, b: 39 }); // #111827
  
  return whiteContrast > blackContrast ? '#ffffff' : '#111827';
}

/**
 * Get a semi-transparent version of the best text color for secondary text
 */
export function getBestSecondaryTextColor(backgroundColor: string): string {
  const bestTextColor = getBestTextColor(backgroundColor);
  return bestTextColor === '#ffffff' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(17, 24, 39, 0.7)'; // More transparent dark color
}

/**
 * Get badge colors with good contrast for a given background
 */
export function getBadgeColors(backgroundColor: string): { 
  backgroundColor: string; 
  color: string; 
  borderColor: string; 
} {
  const isLight = isLightColor(backgroundColor);
  
  if (isLight) {
    // For light backgrounds, use a darker badge
    return {
      backgroundColor: 'rgba(17, 24, 39, 0.1)',
      color: '#111827',
      borderColor: 'rgba(17, 24, 39, 0.2)'
    };
  } else {
    // For dark backgrounds, use a lighter badge
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.3)'
    };
  }
}