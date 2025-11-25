/**
 * Menu Bar Configuration
 *
 * Defines the menu bar structure including the Apple menu,
 * app-specific menus, and system tray items.
 */

import type { MenuDefinition, MenuItem } from '@/types/macos';

// =============================================================================
// APPLE MENU (Always shown on far left)
// =============================================================================

export const appleMenu: MenuDefinition = {
  id: 'apple',
  label: '', // Apple logo icon
  labelAr: '',
  items: [
    {
      id: 'about',
      label: 'About Ruzma',
      labelAr: 'حول رزمة',
      action: () => {
        // Opens about dialog
        console.log('Open About dialog');
      },
    },
    { id: 'sep-1', label: '', labelAr: '', separator: true },
    {
      id: 'preferences',
      label: 'System Preferences...',
      labelAr: 'تفضيلات النظام...',
      shortcut: '⌘,',
      action: () => {
        // Opens Settings app
        console.log('Open Settings');
      },
    },
    {
      id: 'appstore',
      label: 'App Store...',
      labelAr: 'متجر التطبيقات...',
      action: () => {
        // Opens Plans/Subscription page
        console.log('Open Plans');
      },
    },
    { id: 'sep-2', label: '', labelAr: '', separator: true },
    {
      id: 'recent',
      label: 'Recent Items',
      labelAr: 'العناصر الأخيرة',
      submenu: [
        {
          id: 'recent-projects',
          label: 'Projects',
          labelAr: 'المشاريع',
          submenu: [], // Dynamically populated
        },
        {
          id: 'recent-invoices',
          label: 'Invoices',
          labelAr: 'الفواتير',
          submenu: [], // Dynamically populated
        },
        { id: 'sep-recent', label: '', labelAr: '', separator: true },
        {
          id: 'clear-recent',
          label: 'Clear Recent Items',
          labelAr: 'مسح العناصر الأخيرة',
          action: () => {
            console.log('Clear recent items');
          },
        },
      ],
    },
    { id: 'sep-3', label: '', labelAr: '', separator: true },
    {
      id: 'force-quit',
      label: 'Force Quit...',
      labelAr: 'إنهاء إجباري...',
      shortcut: '⌥⌘⎋',
      action: () => {
        // Close all windows
        console.log('Force quit');
      },
    },
    { id: 'sep-4', label: '', labelAr: '', separator: true },
    {
      id: 'lock',
      label: 'Lock Screen',
      labelAr: 'قفل الشاشة',
      shortcut: '⌃⌘Q',
      action: () => {
        console.log('Lock screen');
      },
    },
    {
      id: 'logout',
      label: 'Log Out...',
      labelAr: 'تسجيل الخروج...',
      shortcut: '⇧⌘Q',
      action: () => {
        console.log('Log out');
      },
    },
  ],
};

// =============================================================================
// FILE MENU
// =============================================================================

export const fileMenu: MenuDefinition = {
  id: 'file',
  label: 'File',
  labelAr: 'ملف',
  items: [
    {
      id: 'new-project',
      label: 'New Project',
      labelAr: 'مشروع جديد',
      shortcut: '⌘N',
      action: () => {
        console.log('New project');
      },
    },
    {
      id: 'new-invoice',
      label: 'New Invoice',
      labelAr: 'فاتورة جديدة',
      shortcut: '⇧⌘N',
      action: () => {
        console.log('New invoice');
      },
    },
    {
      id: 'new-client',
      label: 'New Client',
      labelAr: 'عميل جديد',
      shortcut: '⌥⌘N',
      action: () => {
        console.log('New client');
      },
    },
    { id: 'sep-1', label: '', labelAr: '', separator: true },
    {
      id: 'new-from-template',
      label: 'New from Template...',
      labelAr: 'جديد من قالب...',
      shortcut: '⇧⌘T',
      action: () => {
        console.log('New from template');
      },
    },
    { id: 'sep-2', label: '', labelAr: '', separator: true },
    {
      id: 'close-window',
      label: 'Close Window',
      labelAr: 'إغلاق النافذة',
      shortcut: '⌘W',
      action: () => {
        console.log('Close window');
      },
    },
    {
      id: 'close-all',
      label: 'Close All Windows',
      labelAr: 'إغلاق جميع النوافذ',
      shortcut: '⌥⌘W',
      action: () => {
        console.log('Close all windows');
      },
    },
  ],
};

// =============================================================================
// EDIT MENU
// =============================================================================

export const editMenu: MenuDefinition = {
  id: 'edit',
  label: 'Edit',
  labelAr: 'تحرير',
  items: [
    {
      id: 'undo',
      label: 'Undo',
      labelAr: 'تراجع',
      shortcut: '⌘Z',
      disabled: true, // Context-dependent
    },
    {
      id: 'redo',
      label: 'Redo',
      labelAr: 'إعادة',
      shortcut: '⇧⌘Z',
      disabled: true,
    },
    { id: 'sep-1', label: '', labelAr: '', separator: true },
    {
      id: 'cut',
      label: 'Cut',
      labelAr: 'قص',
      shortcut: '⌘X',
    },
    {
      id: 'copy',
      label: 'Copy',
      labelAr: 'نسخ',
      shortcut: '⌘C',
    },
    {
      id: 'paste',
      label: 'Paste',
      labelAr: 'لصق',
      shortcut: '⌘V',
    },
    {
      id: 'select-all',
      label: 'Select All',
      labelAr: 'تحديد الكل',
      shortcut: '⌘A',
    },
  ],
};

// =============================================================================
// VIEW MENU
// =============================================================================

export const viewMenu: MenuDefinition = {
  id: 'view',
  label: 'View',
  labelAr: 'عرض',
  items: [
    {
      id: 'as-icons',
      label: 'as Icons',
      labelAr: 'كأيقونات',
      shortcut: '⌘1',
    },
    {
      id: 'as-list',
      label: 'as List',
      labelAr: 'كقائمة',
      shortcut: '⌘2',
    },
    {
      id: 'as-columns',
      label: 'as Columns',
      labelAr: 'كأعمدة',
      shortcut: '⌘3',
    },
    { id: 'sep-1', label: '', labelAr: '', separator: true },
    {
      id: 'show-toolbar',
      label: 'Show Toolbar',
      labelAr: 'إظهار شريط الأدوات',
      shortcut: '⌥⌘T',
      checked: true,
    },
    {
      id: 'show-sidebar',
      label: 'Show Sidebar',
      labelAr: 'إظهار الشريط الجانبي',
      shortcut: '⌥⌘S',
      checked: true,
    },
    { id: 'sep-2', label: '', labelAr: '', separator: true },
    {
      id: 'enter-fullscreen',
      label: 'Enter Full Screen',
      labelAr: 'ملء الشاشة',
      shortcut: '⌃⌘F',
    },
  ],
};

// =============================================================================
// WINDOW MENU
// =============================================================================

export const windowMenu: MenuDefinition = {
  id: 'window',
  label: 'Window',
  labelAr: 'نافذة',
  items: [
    {
      id: 'minimize',
      label: 'Minimize',
      labelAr: 'تصغير',
      shortcut: '⌘M',
      action: () => {
        console.log('Minimize');
      },
    },
    {
      id: 'zoom',
      label: 'Zoom',
      labelAr: 'تكبير',
      action: () => {
        console.log('Zoom');
      },
    },
    { id: 'sep-1', label: '', labelAr: '', separator: true },
    {
      id: 'tile-left',
      label: 'Tile Window to Left of Screen',
      labelAr: 'تبليط يسار الشاشة',
    },
    {
      id: 'tile-right',
      label: 'Tile Window to Right of Screen',
      labelAr: 'تبليط يمين الشاشة',
    },
    { id: 'sep-2', label: '', labelAr: '', separator: true },
    {
      id: 'bring-all-front',
      label: 'Bring All to Front',
      labelAr: 'إحضار الكل للأمام',
      action: () => {
        console.log('Bring all to front');
      },
    },
    { id: 'sep-3', label: '', labelAr: '', separator: true },
    // Open windows will be dynamically added here
  ],
};

// =============================================================================
// HELP MENU
// =============================================================================

export const helpMenu: MenuDefinition = {
  id: 'help',
  label: 'Help',
  labelAr: 'مساعدة',
  items: [
    {
      id: 'search',
      label: 'Search',
      labelAr: 'بحث',
      // This is the search field, not a regular item
    },
    { id: 'sep-1', label: '', labelAr: '', separator: true },
    {
      id: 'ruzma-help',
      label: 'Ruzma Help',
      labelAr: 'مساعدة رزمة',
      shortcut: '⌘?',
      action: () => {
        console.log('Open help');
      },
    },
    {
      id: 'documentation',
      label: 'Documentation',
      labelAr: 'التوثيق',
      action: () => {
        console.log('Open documentation');
      },
    },
    { id: 'sep-2', label: '', labelAr: '', separator: true },
    {
      id: 'contact-support',
      label: 'Contact Support',
      labelAr: 'تواصل مع الدعم',
      action: () => {
        console.log('Contact support');
      },
    },
    {
      id: 'feedback',
      label: 'Send Feedback',
      labelAr: 'إرسال ملاحظات',
      action: () => {
        console.log('Send feedback');
      },
    },
  ],
};

// =============================================================================
// DEFAULT MENU BAR (for most apps)
// =============================================================================

export const defaultMenuBar: MenuDefinition[] = [
  appleMenu,
  fileMenu,
  editMenu,
  viewMenu,
  windowMenu,
  helpMenu,
];

// =============================================================================
// APP-SPECIFIC MENUS
// =============================================================================

/**
 * Get menus for a specific app
 * Apps can have custom menus that replace or extend the defaults
 */
export function getMenusForApp(appId: string): MenuDefinition[] {
  // For now, return default menus
  // In the future, each app can define custom menus
  return defaultMenuBar;
}

// =============================================================================
// MENU CONSTANTS
// =============================================================================

/**
 * Menu bar height in pixels
 */
export const MENU_BAR_HEIGHT = 25;

/**
 * Menu styling constants
 */
export const MENU_STYLES = {
  /** Height of menu bar */
  height: 25,

  /** Font size for menu items */
  fontSize: 13,

  /** Padding for menu items */
  itemPadding: '4px 12px',

  /** Border radius for dropdown menus */
  dropdownRadius: 6,

  /** Shadow for dropdown menus */
  dropdownShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',

  /** Background colors */
  bgLight: 'rgba(255, 255, 255, 0.85)',
  bgDark: 'rgba(40, 40, 40, 0.85)',

  /** Text colors */
  textLight: '#000',
  textDark: '#fff',
} as const;
