/**
 * Wallpaper Configuration
 *
 * Available wallpapers for the macOS desktop.
 * Includes both local and gradient-based options.
 */

export interface WallpaperOption {
  id: string;
  name: string;
  nameAr: string;
  type: 'image' | 'gradient' | 'color';
  value: string; // URL for images, CSS gradient/color for others
  thumbnail?: string; // Small preview image
  category: 'ventura' | 'gradient' | 'solid' | 'custom';
}

// =============================================================================
// WALLPAPER OPTIONS
// =============================================================================

export const wallpapers: WallpaperOption[] = [
  // Ventura-style wallpapers (gradients that mimic macOS)
  {
    id: 'ventura-1',
    name: 'Ventura Light',
    nameAr: 'فينتورا فاتح',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    category: 'ventura',
  },
  {
    id: 'ventura-2',
    name: 'Ventura Dark',
    nameAr: 'فينتورا داكن',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    category: 'ventura',
  },
  {
    id: 'ventura-3',
    name: 'Ventura Sunrise',
    nameAr: 'فينتورا شروق',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    category: 'ventura',
  },
  {
    id: 'ventura-4',
    name: 'Ventura Ocean',
    nameAr: 'فينتورا محيط',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'ventura',
  },
  {
    id: 'ventura-5',
    name: 'Ventura Desert',
    nameAr: 'فينتورا صحراء',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    category: 'ventura',
  },

  // Abstract gradients
  {
    id: 'gradient-1',
    name: 'Aurora',
    nameAr: 'أورورا',
    type: 'gradient',
    value: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
    category: 'gradient',
  },
  {
    id: 'gradient-2',
    name: 'Sunset',
    nameAr: 'غروب',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    category: 'gradient',
  },
  {
    id: 'gradient-3',
    name: 'Mint',
    nameAr: 'نعناع',
    type: 'gradient',
    value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    category: 'gradient',
  },
  {
    id: 'gradient-4',
    name: 'Lavender',
    nameAr: 'لافندر',
    type: 'gradient',
    value: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
    category: 'gradient',
  },
  {
    id: 'gradient-5',
    name: 'Night Sky',
    nameAr: 'سماء الليل',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a3a 50%, #2d2d5a 100%)',
    category: 'gradient',
  },

  // Solid colors
  {
    id: 'solid-1',
    name: 'Space Gray',
    nameAr: 'رمادي فضائي',
    type: 'color',
    value: '#1d1d1f',
    category: 'solid',
  },
  {
    id: 'solid-2',
    name: 'Silver',
    nameAr: 'فضي',
    type: 'color',
    value: '#e5e5e7',
    category: 'solid',
  },
  {
    id: 'solid-3',
    name: 'Midnight Blue',
    nameAr: 'أزرق منتصف الليل',
    type: 'color',
    value: '#0a1628',
    category: 'solid',
  },
  {
    id: 'solid-4',
    name: 'Forest Green',
    nameAr: 'أخضر غابة',
    type: 'color',
    value: '#1a3a2a',
    category: 'solid',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get wallpaper by ID
 */
export function getWallpaper(id: string): WallpaperOption | undefined {
  return wallpapers.find((w) => w.id === id);
}

/**
 * Get wallpapers by category
 */
export function getWallpapersByCategory(
  category: WallpaperOption['category']
): WallpaperOption[] {
  return wallpapers.filter((w) => w.category === category);
}

/**
 * Get CSS background value for a wallpaper
 */
export function getWallpaperBackground(wallpaper: WallpaperOption): string {
  switch (wallpaper.type) {
    case 'image':
      return `url(${wallpaper.value}) center/cover no-repeat`;
    case 'gradient':
    case 'color':
      return wallpaper.value;
    default:
      return wallpaper.value;
  }
}

/**
 * Default wallpaper
 */
export const DEFAULT_WALLPAPER_ID = 'ventura-1';

/**
 * Get the default wallpaper
 */
export function getDefaultWallpaper(): WallpaperOption {
  return getWallpaper(DEFAULT_WALLPAPER_ID) || wallpapers[0];
}
