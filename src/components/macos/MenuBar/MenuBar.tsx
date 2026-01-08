/**
 * Menu Bar Component
 *
 * The macOS-style menu bar at the top of the screen.
 * Features:
 * - Apple menu (left)
 * - App menus (left, after Apple)
 * - System tray (right): time, language, notifications, user
 * - Frosted glass background
 * - RTL support (flips layout)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppleMenu } from './AppleMenu';
import { AppMenu } from './AppMenu';
import { SystemTray } from './SystemTray';
import { MENU_BAR_HEIGHT } from '@/lib/macos/menuConfig';

// =============================================================================
// TYPES
// =============================================================================

interface MenuBarProps {
  /** Custom className */
  className?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MenuBar({ className }: MenuBarProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <header
      className={cn(
        'menubar fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between',
        // Glass morphism background
        'bg-white/80 backdrop-blur-xl',
        // Border at bottom
        'border-b border-black/10',
        // Shadow
        'shadow-sm',
        // RTL: Flex direction reverses for proper layout
        isRTL && 'flex-row-reverse',
        className
      )}
      style={{
        height: MENU_BAR_HEIGHT,
      }}
      role="menubar"
      aria-label={isRTL ? 'شريط القوائم' : 'Menu Bar'}
    >
      {/* Left Side: Apple Menu + App Menus */}
      <div
        className={cn(
          'menubar-left flex items-center h-full',
          isRTL && 'flex-row-reverse'
        )}
      >
        <AppleMenu />
        <AppMenu />
      </div>

      {/* Right Side: System Tray */}
      <div
        className={cn(
          'menubar-right flex items-center h-full px-2',
          isRTL && 'flex-row-reverse'
        )}
      >
        <SystemTray />
      </div>
    </header>
  );
}

export default MenuBar;
