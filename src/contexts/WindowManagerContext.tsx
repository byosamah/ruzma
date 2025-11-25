/**
 * Window Manager Context
 *
 * Provides window management operations to all components in the app.
 * Integrates with the Zustand store and app configurations.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useWindowStore } from '@/stores/windowStore';
import { appConfigs, getAppConfig } from '@/lib/macos/windowConfig';
import type {
  WindowState,
  Position,
  Size,
  AppConfig,
  WindowManagerActions,
} from '@/types/macos';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

interface WindowManagerContextValue extends WindowManagerActions {
  /** All registered app configurations */
  apps: AppConfig[];

  /** Get app config by ID */
  getApp: (appId: string) => AppConfig | undefined;

  /** All currently open windows */
  windows: WindowState[];

  /** Currently active/focused window */
  activeWindow: WindowState | undefined;

  /** Active window ID */
  activeWindowId: string | null;

  /** Minimized windows (for dock) */
  minimizedWindows: WindowState[];

  /** Check if an app has any open windows */
  isAppRunning: (appId: string) => boolean;

  /** Open an app by its ID (convenience method) */
  openApp: (appId: string, data?: Record<string, unknown>) => string | null;

  /** Focus an app's window (bring to front) */
  focusApp: (appId: string) => void;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface WindowManagerProviderProps {
  children: ReactNode;
}

export function WindowManagerProvider({ children }: WindowManagerProviderProps) {
  // Get store state and actions
  const store = useWindowStore();

  // ==========================================================================
  // WINDOW OPERATIONS
  // ==========================================================================

  /**
   * Open a window for a specific app
   */
  const openWindow = useCallback(
    (appId: string, data?: Record<string, unknown>): string => {
      const appConfig = getAppConfig(appId);

      if (!appConfig) {
        console.error(`[WindowManager] Unknown app: ${appId}`);
        return '';
      }

      return store.openWindow(appId, {
        title: appConfig.name,
        titleAr: appConfig.nameAr,
        defaultSize: appConfig.defaultSize,
        minSize: appConfig.minSize,
        singleton: appConfig.singleton,
        data,
      });
    },
    [store]
  );

  /**
   * Convenience method to open an app
   */
  const openApp = useCallback(
    (appId: string, data?: Record<string, unknown>): string | null => {
      const windowId = openWindow(appId, data);
      return windowId || null;
    },
    [openWindow]
  );

  /**
   * Close a window
   */
  const closeWindow = useCallback(
    (windowId: string) => {
      store.closeWindow(windowId);
    },
    [store]
  );

  /**
   * Close all windows
   */
  const closeAllWindows = useCallback(() => {
    store.closeAllWindows();
  }, [store]);

  /**
   * Minimize a window
   */
  const minimizeWindow = useCallback(
    (windowId: string) => {
      store.minimizeWindow(windowId);
    },
    [store]
  );

  /**
   * Maximize a window
   */
  const maximizeWindow = useCallback(
    (windowId: string) => {
      store.maximizeWindow(windowId);
    },
    [store]
  );

  /**
   * Restore a window from minimized/maximized state
   */
  const restoreWindow = useCallback(
    (windowId: string) => {
      store.restoreWindow(windowId);
    },
    [store]
  );

  /**
   * Focus a window (bring to front)
   */
  const focusWindow = useCallback(
    (windowId: string) => {
      store.focusWindow(windowId);
    },
    [store]
  );

  /**
   * Move a window to a new position
   */
  const moveWindow = useCallback(
    (windowId: string, position: Position) => {
      store.moveWindow(windowId, position);
    },
    [store]
  );

  /**
   * Resize a window
   */
  const resizeWindow = useCallback(
    (windowId: string, size: Size) => {
      store.resizeWindow(windowId, size);
    },
    [store]
  );

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  const getWindow = useCallback(
    (windowId: string) => {
      return store.getWindow(windowId);
    },
    [store]
  );

  const getWindowsByApp = useCallback(
    (appId: string) => {
      return store.getWindowsByApp(appId);
    },
    [store]
  );

  const getActiveWindow = useCallback(() => {
    return store.getActiveWindow();
  }, [store]);

  const getAllWindows = useCallback(() => {
    return store.windows;
  }, [store.windows]);

  const getMinimizedWindows = useCallback(() => {
    return store.windows.filter((w) => w.isMinimized);
  }, [store.windows]);

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Focus an app (bring its windows to front)
   */
  const focusApp = useCallback(
    (appId: string) => {
      const appWindows = store.getWindowsByApp(appId);
      if (appWindows.length > 0) {
        // Focus the most recently opened window
        const mostRecent = appWindows.reduce((a, b) =>
          a.openedAt > b.openedAt ? a : b
        );
        store.focusWindow(mostRecent.id);
      }
    },
    [store]
  );

  const bringAllToFront = useCallback(
    (appId: string) => {
      store.bringAllToFront(appId);
    },
    [store]
  );

  const cascadeWindows = useCallback(() => {
    store.cascadeWindows();
  }, [store]);

  const tileWindows = useCallback(() => {
    store.tileWindows();
  }, [store]);

  // ==========================================================================
  // DERIVED STATE (memoized to prevent infinite loops)
  // ==========================================================================

  const windows = useMemo(
    () => store.windows.filter((w) => w.isOpen),
    [store.windows]
  );
  const activeWindow = useMemo(
    () => store.getActiveWindow(),
    [store]
  );
  const minimizedWindows = useMemo(
    () => store.windows.filter((w) => w.isMinimized),
    [store.windows]
  );

  const isAppRunning = useCallback(
    (appId: string) => {
      return store.isAppRunning(appId);
    },
    [store]
  );

  const getApp = useCallback((appId: string) => {
    return getAppConfig(appId);
  }, []);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue = useMemo<WindowManagerContextValue>(
    () => ({
      // App configs
      apps: appConfigs,
      getApp,

      // State
      windows,
      activeWindow,
      activeWindowId: store.activeWindowId,
      minimizedWindows,
      isAppRunning,

      // Window lifecycle
      openWindow,
      openApp,
      closeWindow,
      closeAllWindows,
      focusApp,

      // Window state
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,

      // Position/size
      moveWindow,
      resizeWindow,

      // Queries
      getWindow,
      getWindowsByApp,
      getActiveWindow,
      getAllWindows,
      getMinimizedWindows,

      // Utilities
      bringAllToFront,
      cascadeWindows,
      tileWindows,
    }),
    [
      windows,
      activeWindow,
      store.activeWindowId,
      minimizedWindows,
      isAppRunning,
      getApp,
      openWindow,
      openApp,
      closeWindow,
      closeAllWindows,
      focusApp,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
      getWindow,
      getWindowsByApp,
      getActiveWindow,
      getAllWindows,
      getMinimizedWindows,
      bringAllToFront,
      cascadeWindows,
      tileWindows,
    ]
  );

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
    </WindowManagerContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access the window manager context
 */
export function useWindowManager(): WindowManagerContextValue {
  const context = useContext(WindowManagerContext);

  if (!context) {
    throw new Error(
      'useWindowManager must be used within a WindowManagerProvider'
    );
  }

  return context;
}

/**
 * Hook to get a specific window's state
 */
export function useWindow(windowId: string): WindowState | undefined {
  const { getWindow } = useWindowManager();
  return getWindow(windowId);
}

/**
 * Hook to get windows for a specific app
 */
export function useAppWindows(appId: string): WindowState[] {
  const { getWindowsByApp } = useWindowManager();
  return getWindowsByApp(appId);
}

/**
 * Hook to check if an app is running
 */
export function useIsAppRunning(appId: string): boolean {
  const { isAppRunning } = useWindowManager();
  return isAppRunning(appId);
}

/**
 * Hook for window controls (used by Window component)
 */
export function useWindowControls(windowId: string) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    getWindow,
  } = useWindowManager();

  return useMemo(
    () => ({
      window: getWindow(windowId),
      close: () => closeWindow(windowId),
      minimize: () => minimizeWindow(windowId),
      maximize: () => maximizeWindow(windowId),
      focus: () => focusWindow(windowId),
      move: (position: Position) => moveWindow(windowId, position),
      resize: (size: Size) => resizeWindow(windowId, size),
    }),
    [
      windowId,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
      getWindow,
    ]
  );
}
