/**
 * App Menu Component
 *
 * Shows the menus for the currently active/focused application.
 * Displays: File, Edit, View, Window, Help menus (and app name in bold)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { MenuDropdown, MenuItem } from './MenuDropdown';
import {
  fileMenu,
  editMenu,
  viewMenu,
  windowMenu,
  helpMenu,
  type MenuDefinition,
} from '@/lib/macos/menuConfig';
import type { MenuDefinition as MenuDef, MenuItem as MenuItemType } from '@/types/macos';

// =============================================================================
// TYPES
// =============================================================================

interface MenuBarItemProps {
  /** Menu definition */
  menu: MenuDef;
  /** Is this menu currently open? */
  isOpen: boolean;
  /** Open this menu */
  onOpen: () => void;
  /** Close all menus */
  onClose: () => void;
}

// =============================================================================
// CONVERT CONFIG MENU TO DROPDOWN MENU
// =============================================================================

function convertToDropdownItems(
  items: MenuItemType[],
  windowActions: {
    closeWindow: (id: string) => void;
    closeAllWindows: () => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
  },
  activeWindowId: string | null
): MenuItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    labelAr: item.labelAr,
    shortcut: item.shortcut,
    isSeparator: item.separator,
    disabled: item.disabled,
    onClick: item.action
      ? () => item.action?.()
      : undefined,
  }));
}

// =============================================================================
// MENU BAR ITEM COMPONENT
// =============================================================================

function MenuBarItem({ menu, isOpen, onOpen, onClose }: MenuBarItemProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { closeWindow, closeAllWindows, minimizeWindow, maximizeWindow, activeWindowId } =
    useWindowManager();

  // Convert menu items
  const dropdownItems = useMemo(() => {
    return convertToDropdownItems(
      menu.items,
      { closeWindow, closeAllWindows, minimizeWindow, maximizeWindow },
      activeWindowId
    );
  }, [menu.items, closeWindow, closeAllWindows, minimizeWindow, maximizeWindow, activeWindowId]);

  // Get display label
  const label = isRTL && menu.labelAr ? menu.labelAr : menu.label;

  return (
    <div className="menu-bar-item relative">
      <button
        className={cn(
          'menu-bar-trigger px-3 py-1',
          'text-sm font-normal',
          'hover:bg-black/10 active:bg-black/15',
          'rounded-[4px]',
          'focus:outline-none',
          'transition-colors duration-75',
          isOpen && 'bg-black/10'
        )}
        onClick={onOpen}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {label}
      </button>

      <MenuDropdown
        items={dropdownItems}
        isOpen={isOpen}
        onClose={onClose}
        align="left"
      />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AppMenu() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { dir } = useLanguage();
  const { activeWindow, apps } = useWindowManager();
  const isRTL = dir === 'rtl';

  // Get active app name
  const activeAppName = useMemo(() => {
    if (!activeWindow) {
      return isRTL ? 'رزمة' : 'Finder';
    }

    const appConfig = apps.find((app) => app.id === activeWindow.appId);
    if (!appConfig) return isRTL ? 'رزمة' : 'Ruzma';

    return isRTL ? appConfig.nameAr : appConfig.name;
  }, [activeWindow, apps, isRTL]);

  // Define menus array
  const menus: MenuDef[] = useMemo(
    () => [fileMenu, editMenu, viewMenu, windowMenu, helpMenu],
    []
  );

  /**
   * Handle menu open
   */
  const handleMenuOpen = useCallback((menuId: string) => {
    setOpenMenuId((current) => (current === menuId ? null : menuId));
  }, []);

  /**
   * Handle menu close
   */
  const handleMenuClose = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  return (
    <div
      className={cn(
        'app-menu flex items-center gap-0.5',
        isRTL && 'flex-row-reverse'
      )}
    >
      {/* Active App Name (Bold) */}
      <div className="app-name px-3 py-1">
        <span className="text-sm font-semibold">{activeAppName}</span>
      </div>

      {/* Menu Items */}
      {menus.map((menu) => (
        <MenuBarItem
          key={menu.id}
          menu={menu}
          isOpen={openMenuId === menu.id}
          onOpen={() => handleMenuOpen(menu.id)}
          onClose={handleMenuClose}
        />
      ))}
    </div>
  );
}

export default AppMenu;
