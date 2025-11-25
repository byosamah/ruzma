/**
 * Apple Menu Component
 *
 * The Apple logo dropdown menu (top-left corner).
 * Contains system-wide options like About, Settings, Log Out.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { authService } from '@/services/api/authService';
import { MenuDropdown, MenuItem } from './MenuDropdown';
import { useT } from '@/lib/i18n';

// =============================================================================
// APPLE LOGO ICON
// =============================================================================

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 814 1000"
      className={className}
      fill="currentColor"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 781.5 0 622 0 472.2c0-242.1 157.3-370 311.5-370 82.1 0 150.3 54.2 201.9 54.2 49.5 0 126.6-57.5 220.1-57.5 35.5 0 163.3 2.9 248.6 111zM554.1 74.8c31.3-37 53.5-88.1 53.5-139.3 0-7.1-.6-14.3-1.9-20-51 1.9-111.4 34-147.8 76.6-28.7 33-55.8 83.9-55.8 135.9 0 7.8.9 15.6 1.3 18.1 2.6.4 6.5.9 10.4.9 45.7 0 103.7-30.7 140.3-72.2z" />
    </svg>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AppleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { dir } = useLanguage();
  const { openApp } = useWindowManager();
  const t = useT();
  const isRTL = dir === 'rtl';

  /**
   * Handle sign out
   */
  const handleSignOut = useCallback(async () => {
    try {
      await authService.signOut();
      // The auth state change will trigger redirect to login
    } catch (error) {
      console.error('[AppleMenu] Sign out error:', error);
    }
  }, []);

  /**
   * Open Settings app
   */
  const handleOpenSettings = useCallback(() => {
    openApp('settings');
  }, [openApp]);

  /**
   * Open Plans/Store
   */
  const handleOpenPlans = useCallback(() => {
    openApp('plans');
  }, [openApp]);

  /**
   * Menu items configuration
   */
  const menuItems: MenuItem[] = [
    {
      id: 'about',
      label: 'About Ruzma',
      labelAr: 'حول رزمة',
      onClick: () => {
        // Could open an About modal/window
        console.log('[AppleMenu] About clicked');
      },
    },
    {
      id: 'separator-1',
      label: '',
      isSeparator: true,
    },
    {
      id: 'settings',
      label: 'System Preferences...',
      labelAr: 'تفضيلات النظام...',
      shortcut: '⌘,',
      onClick: handleOpenSettings,
    },
    {
      id: 'plans',
      label: 'App Store...',
      labelAr: 'متجر التطبيقات...',
      onClick: handleOpenPlans,
    },
    {
      id: 'separator-2',
      label: '',
      isSeparator: true,
    },
    {
      id: 'recent',
      label: 'Recent Items',
      labelAr: 'العناصر الأخيرة',
      disabled: true, // TODO: Implement recent items
    },
    {
      id: 'separator-3',
      label: '',
      isSeparator: true,
    },
    {
      id: 'force-quit',
      label: 'Force Quit...',
      labelAr: 'إنهاء إجباري...',
      shortcut: '⌥⌘⎋',
      disabled: true, // Not applicable in web
    },
    {
      id: 'separator-4',
      label: '',
      isSeparator: true,
    },
    {
      id: 'sleep',
      label: 'Sleep',
      labelAr: 'إسبات',
      disabled: true, // Not applicable in web
    },
    {
      id: 'restart',
      label: 'Restart...',
      labelAr: 'إعادة التشغيل...',
      disabled: true, // Not applicable in web
    },
    {
      id: 'shutdown',
      label: 'Shut Down...',
      labelAr: 'إيقاف التشغيل...',
      disabled: true, // Not applicable in web
    },
    {
      id: 'separator-5',
      label: '',
      isSeparator: true,
    },
    {
      id: 'lock',
      label: 'Lock Screen',
      labelAr: 'قفل الشاشة',
      shortcut: '⌃⌘Q',
      onClick: handleSignOut, // Lock = sign out for web
    },
    {
      id: 'logout',
      label: 'Log Out...',
      labelAr: 'تسجيل الخروج...',
      shortcut: '⇧⌘Q',
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="apple-menu relative">
      {/* Apple Logo Button */}
      <button
        className={cn(
          'apple-menu-trigger flex items-center justify-center',
          'w-10 h-full px-3',
          'hover:bg-black/10 active:bg-black/15',
          'focus:outline-none',
          'transition-colors duration-75',
          isOpen && 'bg-black/10'
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isRTL ? 'قائمة أبل' : 'Apple Menu'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <AppleLogo className="w-4 h-4 opacity-90" />
      </button>

      {/* Dropdown Menu */}
      <MenuDropdown
        items={menuItems}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        align="left"
      />
    </div>
  );
}

export default AppleMenu;
