/**
 * DesktopIconGrid Component
 *
 * Manages the grid of desktop icons including:
 * - Grid layout positioning
 * - Selection state
 * - Opening windows on double-click
 *
 * Icons are positioned in a grid from top-right (LTR) or top-left (RTL)
 * following macOS conventions.
 */

import React, { useCallback, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { DesktopIcon, type DesktopIconData } from './DesktopIcon';

// =============================================================================
// TYPES
// =============================================================================

interface DesktopIconGridProps {
  /** Custom icons to display (in addition to defaults) */
  customIcons?: DesktopIconData[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Grid configuration
const GRID_CELL_WIDTH = 100;
const GRID_CELL_HEIGHT = 100;
const GRID_PADDING = 16;

// =============================================================================
// DEFAULT ICONS
// =============================================================================

/**
 * Default desktop icons (shortcuts to main apps)
 * In a real implementation, these would come from user preferences
 */
const defaultIcons: DesktopIconData[] = [
  {
    id: 'projects-folder',
    name: 'Projects',
    nameAr: 'المشاريع',
    icon: '📁',
    type: 'folder',
    position: { row: 0, col: 0 },
    data: { openApp: 'finder' },
  },
  {
    id: 'clients-folder',
    name: 'Clients',
    nameAr: 'العملاء',
    icon: '📁',
    type: 'folder',
    position: { row: 1, col: 0 },
    data: { openApp: 'clients' },
  },
  {
    id: 'invoices-folder',
    name: 'Invoices',
    nameAr: 'الفواتير',
    icon: '📁',
    type: 'folder',
    position: { row: 2, col: 0 },
    data: { openApp: 'invoices' },
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function DesktopIconGrid({ customIcons = [] }: DesktopIconGridProps) {
  const { dir } = useLanguage();
  const { openApp } = useWindowManager();
  const isRTL = dir === 'rtl';

  // Track selected icon
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  // Combine default and custom icons
  const allIcons = useMemo(
    () => [...defaultIcons, ...customIcons],
    [customIcons]
  );

  /**
   * Handle single click on icon - select it
   */
  const handleIconClick = useCallback((icon: DesktopIconData) => {
    setSelectedIconId(icon.id);
  }, []);

  /**
   * Handle double click on icon - open it
   */
  const handleIconDoubleClick = useCallback(
    (icon: DesktopIconData) => {
      // Clear selection
      setSelectedIconId(null);

      // Determine which app to open
      const appToOpen = icon.data?.openApp as string | undefined;

      if (appToOpen) {
        // Open the specified app
        openApp(appToOpen, {
          title: icon.name,
          titleAr: icon.nameAr,
          data: icon.data,
        });
      } else if (icon.type === 'folder') {
        // Default: open folders in Finder
        openApp('finder', {
          title: icon.name,
          titleAr: icon.nameAr,
          data: { folderId: icon.id },
        });
      }
    },
    [openApp]
  );

  /**
   * Handle click on empty grid area - deselect
   */
  const handleGridClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIconId(null);
    }
  }, []);

  /**
   * Calculate icon position based on grid cell
   */
  const getIconPosition = (row: number, col: number): React.CSSProperties => {
    const top = GRID_PADDING + row * GRID_CELL_HEIGHT;

    if (isRTL) {
      // RTL: icons start from left
      const left = GRID_PADDING + col * GRID_CELL_WIDTH;
      return { position: 'absolute', top, left };
    } else {
      // LTR: icons start from right (macOS default)
      const right = GRID_PADDING + col * GRID_CELL_WIDTH;
      return { position: 'absolute', top, right };
    }
  };

  return (
    <div
      className="desktop-icon-grid absolute inset-0"
      onClick={handleGridClick}
    >
      {allIcons.map((icon) => (
        <div
          key={icon.id}
          style={getIconPosition(icon.position.row, icon.position.col)}
        >
          <DesktopIcon
            icon={icon}
            isSelected={selectedIconId === icon.id}
            onClick={handleIconClick}
            onDoubleClick={handleIconDoubleClick}
          />
        </div>
      ))}
    </div>
  );
}

export default DesktopIconGrid;
