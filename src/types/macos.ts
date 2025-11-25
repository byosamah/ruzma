/**
 * macOS Desktop Interface Type Definitions
 *
 * These types define the structure for the macOS Ventura-style
 * desktop interface including windows, apps, desktop icons,
 * menus, and dock configuration.
 */

import { ComponentType, LazyExoticComponent } from 'react';

// =============================================================================
// WINDOW TYPES
// =============================================================================

/**
 * Represents the state of a single window in the window manager
 */
export interface WindowState {
  /** Unique identifier for this window instance */
  id: string;

  /** The app that owns this window (references AppConfig.id) */
  appId: string;

  /** Window title displayed in title bar */
  title: string;

  /** Arabic title for RTL mode */
  titleAr?: string;

  /** Whether the window is currently visible */
  isOpen: boolean;

  /** Whether the window is minimized to dock */
  isMinimized: boolean;

  /** Whether the window is maximized (full screen) */
  isMaximized: boolean;

  /** Whether this window currently has focus */
  isFocused: boolean;

  /** Current position on screen */
  position: Position;

  /** Current size */
  size: Size;

  /** Minimum allowed size */
  minSize: Size;

  /** Z-index for stacking order (higher = on top) */
  zIndex: number;

  /** Optional data passed to the window (e.g., projectId) */
  data?: Record<string, unknown>;

  /** Timestamp when window was opened */
  openedAt: number;
}

/**
 * Position on screen
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

// =============================================================================
// APP CONFIGURATION
// =============================================================================

/**
 * Configuration for an application that can be opened as a window
 */
export interface AppConfig {
  /** Unique identifier for this app */
  id: string;

  /** Display name (English) */
  name: string;

  /** Display name (Arabic) */
  nameAr: string;

  /** Icon - can be emoji, URL, or component name */
  icon: string;

  /** The React component to render in the window */
  component: LazyExoticComponent<ComponentType<AppWindowProps>>;

  /** Default window size when opening */
  defaultSize: Size;

  /** Minimum window size (for resize constraints) */
  minSize: Size;

  /** Whether the window can be resized */
  resizable: boolean;

  /** Whether this app appears in the dock */
  inDock: boolean;

  /** Position in dock (lower = more left) */
  dockPosition?: number;

  /** If true, only one window of this app can exist at a time */
  singleton: boolean;

  /** Optional keyboard shortcut to open (e.g., "⌘D" for Dashboard) */
  shortcut?: string;

  /** App-specific menu items */
  menuItems?: MenuDefinition[];
}

/**
 * Props passed to all app window components
 */
export interface AppWindowProps {
  /** The window state for this instance */
  windowState: WindowState;

  /** Callback to update window title */
  setTitle: (title: string) => void;

  /** Callback to close this window */
  onClose: () => void;
}

// =============================================================================
// DESKTOP ICONS
// =============================================================================

/**
 * An icon on the desktop (folder, file, or app shortcut)
 */
export interface DesktopIcon {
  /** Unique identifier */
  id: string;

  /** Type of icon */
  type: 'folder' | 'file' | 'app';

  /** Display name */
  name: string;

  /** Arabic name for RTL */
  nameAr?: string;

  /** Icon image/emoji */
  icon: string;

  /** Position on desktop grid */
  position: Position;

  /** Is currently selected */
  isSelected?: boolean;

  /** Associated data (e.g., projectId for project folders) */
  data?: {
    projectId?: string;
    projectSlug?: string;
    appId?: string;
    [key: string]: unknown;
  };
}

// =============================================================================
// MENU SYSTEM
// =============================================================================

/**
 * A menu in the menu bar (File, Edit, View, etc.)
 */
export interface MenuDefinition {
  /** Unique identifier */
  id: string;

  /** Display label (English) */
  label: string;

  /** Display label (Arabic) */
  labelAr: string;

  /** Menu items */
  items: MenuItem[];
}

/**
 * A single item in a menu
 */
export interface MenuItem {
  /** Unique identifier */
  id: string;

  /** Display label (English) */
  label: string;

  /** Display label (Arabic) */
  labelAr: string;

  /** Keyboard shortcut (e.g., "⌘N") */
  shortcut?: string;

  /** Action to perform when clicked */
  action?: () => void;

  /** Submenu items */
  submenu?: MenuItem[];

  /** Is this a separator line? */
  separator?: boolean;

  /** Is this item disabled? */
  disabled?: boolean;

  /** Is this item checked (for toggle items)? */
  checked?: boolean;
}

// =============================================================================
// DOCK
// =============================================================================

/**
 * Configuration for a dock item
 */
export interface DockItemConfig {
  /** App ID this dock item represents */
  appId: string;

  /** Position in dock (left to right) */
  position: number;

  /** Is app currently running (shows indicator dot) */
  isRunning?: boolean;

  /** Number of minimized windows (shows badge) */
  minimizedCount?: number;
}

/**
 * A minimized window in the dock
 */
export interface MinimizedWindow {
  /** Window ID */
  windowId: string;

  /** App ID */
  appId: string;

  /** Thumbnail preview (data URL) */
  thumbnail?: string;

  /** Window title */
  title: string;
}

// =============================================================================
// SYSTEM STATE
// =============================================================================

/**
 * Current breakpoint for responsive design
 */
export type BreakpointMode = 'desktop' | 'tablet' | 'mobile';

/**
 * Breakpoint definitions
 */
export const BREAKPOINTS = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024 },
} as const;

/**
 * System preferences
 */
export interface SystemPreferences {
  /** Current wallpaper URL */
  wallpaper: string;

  /** Dock magnification enabled */
  dockMagnification: boolean;

  /** Dock icon size (pixels) */
  dockIconSize: number;

  /** Automatically hide dock */
  dockAutoHide: boolean;

  /** Show recent apps in dock */
  showRecentApps: boolean;
}

/**
 * Default system preferences
 */
export const DEFAULT_PREFERENCES: SystemPreferences = {
  wallpaper: '/wallpapers/ventura-1.webp',
  dockMagnification: true,
  dockIconSize: 48,
  dockAutoHide: false,
  showRecentApps: true,
};

// =============================================================================
// WINDOW MANAGER ACTIONS
// =============================================================================

/**
 * Actions available in the window manager
 */
export interface WindowManagerActions {
  // Window lifecycle
  openWindow: (appId: string, data?: Record<string, unknown>) => string;
  closeWindow: (windowId: string) => void;
  closeAllWindows: () => void;

  // Window state
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;

  // Window position/size
  moveWindow: (windowId: string, position: Position) => void;
  resizeWindow: (windowId: string, size: Size) => void;

  // Queries
  getWindow: (windowId: string) => WindowState | undefined;
  getWindowsByApp: (appId: string) => WindowState[];
  getActiveWindow: () => WindowState | undefined;
  getAllWindows: () => WindowState[];
  getMinimizedWindows: () => WindowState[];

  // Utilities
  bringAllToFront: (appId: string) => void;
  cascadeWindows: () => void;
  tileWindows: () => void;
}

// =============================================================================
// CONTEXT MENU
// =============================================================================

/**
 * Context menu configuration (right-click menus)
 */
export interface ContextMenuConfig {
  /** Position where menu should appear */
  position: Position;

  /** Menu items to display */
  items: MenuItem[];

  /** Target element that was right-clicked (for context) */
  target?: {
    type: 'desktop' | 'icon' | 'window' | 'dock';
    id?: string;
    data?: Record<string, unknown>;
  };
}

// =============================================================================
// ANIMATION CONSTANTS
// =============================================================================

/**
 * Spring animation configurations for Framer Motion
 */
export const SPRING_CONFIG = {
  /** Default spring for most animations */
  default: { type: 'spring', stiffness: 300, damping: 30 },

  /** Bouncy spring for dock icons */
  bouncy: { type: 'spring', stiffness: 400, damping: 25 },

  /** Smooth spring for window movements */
  smooth: { type: 'spring', stiffness: 200, damping: 35 },

  /** Quick spring for micro-interactions */
  quick: { type: 'spring', stiffness: 500, damping: 30 },
} as const;

/**
 * Duration constants for CSS transitions
 */
export const TRANSITION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;
