/**
 * App Window Configurations
 *
 * Defines all applications that can be opened as windows in the macOS interface.
 * Each app has its component, default size, dock position, and behavior settings.
 */

import { lazy } from 'react';
import type { AppConfig } from '@/types/macos';

// =============================================================================
// LAZY-LOADED APP COMPONENTS
// =============================================================================

// Main apps (will be created in Phase 5)
const DashboardApp = lazy(() => import('@/components/apps/DashboardApp'));
const FinderApp = lazy(() => import('@/components/apps/FinderApp'));
const ClientsApp = lazy(() => import('@/components/apps/ClientsApp'));
const InvoicesApp = lazy(() => import('@/components/apps/InvoicesApp'));
const SettingsApp = lazy(() => import('@/components/apps/SettingsApp'));
const HelpApp = lazy(() => import('@/components/apps/HelpApp'));

// Individual windows (non-singleton, opened from desktop/finder)
const ProjectWindow = lazy(() => import('@/components/apps/ProjectWindow'));

// =============================================================================
// APP CONFIGURATIONS
// =============================================================================

export const appConfigs: AppConfig[] = [
  // =========================================================================
  // DASHBOARD - Main overview app
  // =========================================================================
  {
    id: 'dashboard',
    name: 'Dashboard',
    nameAr: 'لوحة التحكم',
    icon: '📊', // Can be replaced with custom icon URL
    component: DashboardApp,
    defaultSize: { width: 1000, height: 700 },
    minSize: { width: 600, height: 450 },
    resizable: true,
    inDock: true,
    dockPosition: 1,
    singleton: true,
    shortcut: '⌘D',
  },

  // =========================================================================
  // FINDER - Projects browser (like macOS Finder)
  // =========================================================================
  {
    id: 'finder',
    name: 'Projects',
    nameAr: 'المشاريع',
    icon: '📁',
    component: FinderApp,
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 500, height: 350 },
    resizable: true,
    inDock: true,
    dockPosition: 2,
    singleton: false, // Can open multiple Finder windows
    shortcut: '⌘N',
  },

  // =========================================================================
  // PROJECT WINDOW - Individual project (opened from desktop folder)
  // =========================================================================
  {
    id: 'project',
    name: 'Project',
    nameAr: 'مشروع',
    icon: '📂',
    component: ProjectWindow,
    defaultSize: { width: 950, height: 700 },
    minSize: { width: 600, height: 450 },
    resizable: true,
    inDock: false, // Not in dock, opened from desktop
    singleton: false, // Can open multiple projects
  },

  // =========================================================================
  // CLIENTS - Contacts-style client manager
  // =========================================================================
  {
    id: 'clients',
    name: 'Clients',
    nameAr: 'العملاء',
    icon: '👥',
    component: ClientsApp,
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 550, height: 400 },
    resizable: true,
    inDock: true,
    dockPosition: 3,
    singleton: true,
    shortcut: '⌘C',
  },

  // =========================================================================
  // INVOICES - Invoice management
  // =========================================================================
  {
    id: 'invoices',
    name: 'Invoices',
    nameAr: 'الفواتير',
    icon: '🧾',
    component: InvoicesApp,
    defaultSize: { width: 950, height: 650 },
    minSize: { width: 600, height: 400 },
    resizable: true,
    inDock: true,
    dockPosition: 4,
    singleton: true,
    shortcut: '⌘I',
  },

  // =========================================================================
  // SETTINGS - System Preferences style
  // =========================================================================
  {
    id: 'settings',
    name: 'Settings',
    nameAr: 'الإعدادات',
    icon: '⚙️',
    component: SettingsApp,
    defaultSize: { width: 800, height: 550 },
    minSize: { width: 600, height: 400 },
    resizable: true,
    inDock: true,
    dockPosition: 5,
    singleton: true,
    shortcut: '⌘,',
  },

  // =========================================================================
  // HELP - Help and support
  // =========================================================================
  {
    id: 'help',
    name: 'Help',
    nameAr: 'المساعدة',
    icon: '❓',
    component: HelpApp,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 400, height: 300 },
    resizable: true,
    inDock: false, // Accessed from menu bar
    singleton: true,
    shortcut: '⌘?',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get app configuration by ID
 */
export function getAppConfig(appId: string): AppConfig | undefined {
  return appConfigs.find((app) => app.id === appId);
}

/**
 * Get all apps that should appear in the dock
 */
export function getDockApps(): AppConfig[] {
  return appConfigs
    .filter((app) => app.inDock)
    .sort((a, b) => (a.dockPosition || 0) - (b.dockPosition || 0));
}

/**
 * Get app by keyboard shortcut
 */
export function getAppByShortcut(shortcut: string): AppConfig | undefined {
  return appConfigs.find((app) => app.shortcut === shortcut);
}

// =============================================================================
// APP ICONS MAPPING
// =============================================================================

/**
 * Map of app IDs to their icon URLs (for custom icons)
 * Emoji icons are used as fallback
 */
export const appIcons: Record<string, string> = {
  dashboard: '/icons/dashboard.png',
  finder: '/icons/finder.png',
  project: '/icons/folder.png',
  clients: '/icons/clients.png',
  invoices: '/icons/invoices.png',
  settings: '/icons/settings.png',
  help: '/icons/help.png',
};

/**
 * Get icon for an app (prefers custom icon, falls back to emoji)
 */
export function getAppIcon(appId: string): string {
  const config = getAppConfig(appId);
  // For now, return emoji icons. Custom icons can be added later.
  return config?.icon || '📄';
}
