/**
 * Dock Configuration
 *
 * Defines the dock layout, behavior settings, and helper functions
 * for the macOS-style dock at the bottom of the screen.
 */

import { getDockApps } from './windowConfig';
import type { DockItemConfig, AppConfig } from '@/types/macos';

// =============================================================================
// DOCK CONSTANTS
// =============================================================================

/**
 * Default dock settings
 */
export const DOCK_DEFAULTS = {
  /** Base icon size in pixels */
  iconSize: 48,

  /** Maximum icon size when magnified */
  maxIconSize: 72,

  /** Gap between icons in pixels */
  iconGap: 4,

  /** Padding inside dock container */
  padding: 8,

  /** Border radius of dock container */
  borderRadius: 16,

  /** Height of dock container (auto-calculated based on icon size) */
  get height() {
    return this.iconSize + this.padding * 2 + 8; // 8px for indicator dots
  },

  /** Magnification range in pixels (how far mouse can be to magnify) */
  magnificationRange: 100,

  /** Animation duration for dock appearance */
  animationDuration: 200,

  /** Auto-hide delay in ms */
  autoHideDelay: 1000,
} as const;

// =============================================================================
// DOCK ITEM HELPERS
// =============================================================================

/**
 * Get the initial dock items based on app configurations
 */
export function getInitialDockItems(): DockItemConfig[] {
  const dockApps = getDockApps();

  return dockApps.map((app, index) => ({
    appId: app.id,
    position: app.dockPosition || index + 1,
    isRunning: false,
    minimizedCount: 0,
  }));
}

/**
 * Calculate dock item positions for rendering
 */
export function calculateDockLayout(
  items: DockItemConfig[],
  minimizedCount: number,
  iconSize: number = DOCK_DEFAULTS.iconSize,
  iconGap: number = DOCK_DEFAULTS.iconGap
): {
  totalWidth: number;
  itemPositions: { appId: string; x: number; width: number }[];
  separatorX: number | null;
} {
  const itemPositions: { appId: string; x: number; width: number }[] = [];
  let currentX = DOCK_DEFAULTS.padding;

  // Sort items by position
  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  // Calculate positions for app icons
  sortedItems.forEach((item) => {
    itemPositions.push({
      appId: item.appId,
      x: currentX,
      width: iconSize,
    });
    currentX += iconSize + iconGap;
  });

  // Separator position (if there are minimized windows)
  let separatorX: number | null = null;
  if (minimizedCount > 0) {
    separatorX = currentX;
    currentX += 12 + iconGap; // Separator width + gap

    // Add space for minimized windows (placeholder)
    currentX += minimizedCount * (iconSize * 0.75 + iconGap);
  }

  const totalWidth = currentX + DOCK_DEFAULTS.padding - iconGap;

  return { totalWidth, itemPositions, separatorX };
}

/**
 * Calculate magnification factor based on mouse distance
 */
export function calculateMagnification(
  mouseX: number,
  itemCenterX: number,
  maxDistance: number = DOCK_DEFAULTS.magnificationRange,
  maxScale: number = 1.5
): number {
  const distance = Math.abs(mouseX - itemCenterX);

  if (distance >= maxDistance) {
    return 1;
  }

  // Smooth curve using cosine for natural feel
  const factor = Math.cos((distance / maxDistance) * (Math.PI / 2));
  return 1 + factor * (maxScale - 1);
}

// =============================================================================
// DOCK ANIMATION CONFIGS
// =============================================================================

/**
 * Framer Motion animation variants for dock
 */
export const dockAnimations = {
  /** Container slide in/out */
  container: {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      y: 100,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  },

  /** Icon bounce animation (when launching app) */
  bounce: {
    initial: { y: 0 },
    animate: {
      y: [-10, 0, -6, 0, -3, 0],
      transition: {
        duration: 0.6,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    },
  },

  /** Icon hover scale */
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },

  /** Indicator dot appearance */
  indicator: {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
  },

  /** Tooltip appearance */
  tooltip: {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.15,
      },
    },
  },
};

// =============================================================================
// DOCK STYLE HELPERS
// =============================================================================

/**
 * Get dock container styles
 */
export function getDockContainerStyles(
  iconSize: number = DOCK_DEFAULTS.iconSize
): React.CSSProperties {
  return {
    position: 'fixed',
    bottom: 8,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: DOCK_DEFAULTS.padding,
    borderRadius: DOCK_DEFAULTS.borderRadius,
    // Frosted glass effect
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    zIndex: 9999,
  };
}

/**
 * Get dock container styles for dark mode
 */
export function getDockContainerStylesDark(): React.CSSProperties {
  return {
    ...getDockContainerStyles(),
    background: 'rgba(40, 40, 40, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };
}
