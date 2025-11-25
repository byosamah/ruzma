/**
 * Desktop Component
 *
 * The main macOS desktop canvas that contains:
 * - Wallpaper background
 * - Desktop icons (project folders)
 * - All open windows
 * - The dock at the bottom
 *
 * This is the root component for the macOS-style interface.
 */

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowStore } from '@/stores/windowStore';
import { getWallpaperBackground } from '@/lib/macos/wallpapers';
import { WindowRenderer } from './WindowRenderer';
import { DesktopIconGrid } from './DesktopIconGrid';
import { Dock } from '../Dock';
import { MenuBar } from '../MenuBar';

// Import styles
import '@/styles/macos/macos-desktop.css';
import '@/styles/macos/macos-menubar.css';

// =============================================================================
// TYPES
// =============================================================================

interface DesktopProps {
  /** ID of the wallpaper to use */
  wallpaperId?: string;
  /** Custom className for the desktop */
  className?: string;
  /** Children to render (e.g., menu bar) */
  children?: React.ReactNode;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Menu bar height (we'll add menu bar in Phase 4)
const MENU_BAR_HEIGHT = 25;

// Dock height estimate for positioning
const DOCK_HEIGHT = 70;

// =============================================================================
// COMPONENT
// =============================================================================

export function Desktop({
  wallpaperId = 'ventura-light',
  className,
  children,
}: DesktopProps) {
  const { dir } = useLanguage();

  // Get wallpaper background style
  const wallpaperStyle = useMemo(
    () => getWallpaperBackground(wallpaperId),
    [wallpaperId]
  );

  // Get window store actions for click-to-deselect
  const unfocusAll = useWindowStore((state) => state.unfocusAll);

  /**
   * Handle click on desktop background
   * Deselects all windows (unfocuses them)
   */
  const handleDesktopClick = useCallback(
    (e: React.MouseEvent) => {
      // Only handle clicks directly on the desktop (not on windows/icons)
      if (e.target === e.currentTarget) {
        unfocusAll();
      }
    },
    [unfocusAll]
  );

  return (
    <div
      className={cn(
        'macos-desktop',
        'fixed inset-0 overflow-hidden',
        'select-none',
        className
      )}
      style={{
        // Wallpaper as background
        ...wallpaperStyle,
        // Text direction for RTL support
        direction: dir,
      }}
      onClick={handleDesktopClick}
    >
      {/* Menu bar at the top */}
      <MenuBar />

      {/* Additional children if any */}
      {children}

      {/* Desktop content area (below menu bar, above dock) */}
      <div
        className="macos-desktop-content absolute inset-0"
        style={{
          top: MENU_BAR_HEIGHT,
          bottom: DOCK_HEIGHT + 10, // Leave space for dock
        }}
      >
        {/* Desktop icons grid */}
        <DesktopIconGrid />
      </div>

      {/* Window layer - renders all open windows */}
      <WindowRenderer />

      {/* Dock at the bottom */}
      <Dock />
    </div>
  );
}

export default Desktop;
