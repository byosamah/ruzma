/**
 * Window Manager Store (Zustand)
 *
 * Central state management for all windows in the macOS desktop interface.
 * Handles window lifecycle, positioning, z-index, focus, and persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  WindowState,
  Position,
  Size,
  MinimizedWindow,
  SystemPreferences,
  DEFAULT_PREFERENCES,
} from '@/types/macos';

// =============================================================================
// STORE INTERFACE
// =============================================================================

interface WindowStore {
  // State
  windows: WindowState[];
  activeWindowId: string | null;
  maxZIndex: number;
  minimizedWindows: MinimizedWindow[];
  preferences: SystemPreferences;

  // Window Lifecycle Actions
  openWindow: (
    appId: string,
    config: {
      title: string;
      titleAr?: string;
      defaultSize: Size;
      minSize: Size;
      singleton?: boolean;
      data?: Record<string, unknown>;
    }
  ) => string;
  closeWindow: (windowId: string) => void;
  closeAllWindows: () => void;
  closeAppWindows: (appId: string) => void;

  // Window State Actions
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  unfocusAll: () => void;

  // Window Position/Size Actions
  moveWindow: (windowId: string, position: Position) => void;
  resizeWindow: (windowId: string, size: Size) => void;

  // Query Methods
  getWindow: (windowId: string) => WindowState | undefined;
  getWindowsByApp: (appId: string) => WindowState[];
  getActiveWindow: () => WindowState | undefined;
  getOpenWindows: () => WindowState[];
  isAppRunning: (appId: string) => boolean;

  // Utility Actions
  bringToFront: (windowId: string) => void;
  bringAllToFront: (appId: string) => void;
  cascadeWindows: () => void;
  tileWindows: () => void;

  // Preferences
  setPreference: <K extends keyof SystemPreferences>(
    key: K,
    value: SystemPreferences[K]
  ) => void;
  setWallpaper: (url: string) => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a unique window ID
 */
const generateWindowId = (): string => {
  return `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate centered position for a new window
 */
const getCenteredPosition = (size: Size): Position => {
  // Get viewport dimensions (with fallback for SSR)
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  // Account for menu bar (25px) and dock (70px approximate)
  const availableHeight = viewportHeight - 25 - 70;

  return {
    x: Math.max(50, (viewportWidth - size.width) / 2),
    y: Math.max(50, (availableHeight - size.height) / 2 + 25),
  };
};

/**
 * Calculate cascaded position for overlapping windows
 */
const getCascadedPosition = (
  existingWindows: WindowState[],
  size: Size
): Position => {
  const CASCADE_OFFSET = 30;
  const appWindows = existingWindows.filter((w) => w.isOpen && !w.isMinimized);

  if (appWindows.length === 0) {
    return getCenteredPosition(size);
  }

  // Find the last window position and offset
  const lastWindow = appWindows[appWindows.length - 1];
  return {
    x: lastWindow.position.x + CASCADE_OFFSET,
    y: lastWindow.position.y + CASCADE_OFFSET,
  };
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useWindowStore = create<WindowStore>()(
  persist(
    // Using a simpler approach without immer for now
    (set, get) => ({
      // Initial State
      windows: [],
      activeWindowId: null,
      maxZIndex: 100,
      minimizedWindows: [],
      preferences: {
        wallpaper: '/wallpapers/ventura-1.webp',
        dockMagnification: true,
        dockIconSize: 48,
        dockAutoHide: false,
        showRecentApps: true,
      },

      // =======================================================================
      // WINDOW LIFECYCLE
      // =======================================================================

      openWindow: (appId, config) => {
        const state = get();

        // Check if singleton and already open
        if (config.singleton) {
          const existingWindow = state.windows.find(
            (w) => w.appId === appId && w.isOpen
          );
          if (existingWindow) {
            // Focus existing window instead of opening new one
            get().focusWindow(existingWindow.id);
            return existingWindow.id;
          }
        }

        const windowId = generateWindowId();
        const position = getCascadedPosition(
          state.windows.filter((w) => w.appId === appId),
          config.defaultSize
        );
        const newZIndex = state.maxZIndex + 1;

        const newWindow: WindowState = {
          id: windowId,
          appId,
          title: config.title,
          titleAr: config.titleAr,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          isFocused: true,
          position,
          size: config.defaultSize,
          minSize: config.minSize,
          zIndex: newZIndex,
          data: config.data,
          openedAt: Date.now(),
        };

        set((state) => ({
          windows: [
            ...state.windows.map((w) => ({ ...w, isFocused: false })),
            newWindow,
          ],
          activeWindowId: windowId,
          maxZIndex: newZIndex,
        }));

        console.log(`[WindowStore] Opened window: ${windowId} for app: ${appId}`);
        return windowId;
      },

      closeWindow: (windowId) => {
        set((state) => {
          const updatedWindows = state.windows.filter((w) => w.id !== windowId);
          const updatedMinimized = state.minimizedWindows.filter(
            (m) => m.windowId !== windowId
          );

          // If closing active window, focus the next available
          let newActiveId = state.activeWindowId;
          if (state.activeWindowId === windowId) {
            const openWindows = updatedWindows.filter(
              (w) => w.isOpen && !w.isMinimized
            );
            if (openWindows.length > 0) {
              // Focus the window with highest z-index
              const topWindow = openWindows.reduce((a, b) =>
                a.zIndex > b.zIndex ? a : b
              );
              newActiveId = topWindow.id;
            } else {
              newActiveId = null;
            }
          }

          return {
            windows: updatedWindows.map((w) => ({
              ...w,
              isFocused: w.id === newActiveId,
            })),
            activeWindowId: newActiveId,
            minimizedWindows: updatedMinimized,
          };
        });

        console.log(`[WindowStore] Closed window: ${windowId}`);
      },

      closeAllWindows: () => {
        set({
          windows: [],
          activeWindowId: null,
          minimizedWindows: [],
        });
        console.log('[WindowStore] Closed all windows');
      },

      closeAppWindows: (appId) => {
        set((state) => ({
          windows: state.windows.filter((w) => w.appId !== appId),
          minimizedWindows: state.minimizedWindows.filter(
            (m) => m.appId !== appId
          ),
          activeWindowId:
            state.windows.find((w) => w.id === state.activeWindowId)?.appId ===
            appId
              ? null
              : state.activeWindowId,
        }));
        console.log(`[WindowStore] Closed all windows for app: ${appId}`);
      },

      // =======================================================================
      // WINDOW STATE
      // =======================================================================

      minimizeWindow: (windowId) => {
        set((state) => {
          const window = state.windows.find((w) => w.id === windowId);
          if (!window) return state;

          // Add to minimized list
          const minimized: MinimizedWindow = {
            windowId: window.id,
            appId: window.appId,
            title: window.title,
          };

          // Find next window to focus
          const remainingOpen = state.windows.filter(
            (w) => w.isOpen && !w.isMinimized && w.id !== windowId
          );
          const nextFocused =
            remainingOpen.length > 0
              ? remainingOpen.reduce((a, b) => (a.zIndex > b.zIndex ? a : b))
              : null;

          return {
            windows: state.windows.map((w) =>
              w.id === windowId
                ? { ...w, isMinimized: true, isFocused: false }
                : { ...w, isFocused: w.id === nextFocused?.id }
            ),
            minimizedWindows: [...state.minimizedWindows, minimized],
            activeWindowId: nextFocused?.id || null,
          };
        });

        console.log(`[WindowStore] Minimized window: ${windowId}`);
      },

      maximizeWindow: (windowId) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === windowId ? { ...w, isMaximized: true } : w
          ),
        }));
        console.log(`[WindowStore] Maximized window: ${windowId}`);
      },

      restoreWindow: (windowId) => {
        const state = get();
        const newZIndex = state.maxZIndex + 1;

        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === windowId
              ? {
                  ...w,
                  isMinimized: false,
                  isMaximized: false,
                  isFocused: true,
                  zIndex: newZIndex,
                }
              : { ...w, isFocused: false }
          ),
          minimizedWindows: state.minimizedWindows.filter(
            (m) => m.windowId !== windowId
          ),
          activeWindowId: windowId,
          maxZIndex: newZIndex,
        }));

        console.log(`[WindowStore] Restored window: ${windowId}`);
      },

      focusWindow: (windowId) => {
        const state = get();
        const newZIndex = state.maxZIndex + 1;

        set((state) => ({
          windows: state.windows.map((w) => ({
            ...w,
            isFocused: w.id === windowId,
            zIndex: w.id === windowId ? newZIndex : w.zIndex,
          })),
          activeWindowId: windowId,
          maxZIndex: newZIndex,
        }));
      },

      unfocusAll: () => {
        set((state) => ({
          windows: state.windows.map((w) => ({ ...w, isFocused: false })),
          activeWindowId: null,
        }));
      },

      // =======================================================================
      // WINDOW POSITION/SIZE
      // =======================================================================

      moveWindow: (windowId, position) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === windowId ? { ...w, position } : w
          ),
        }));
      },

      resizeWindow: (windowId, size) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === windowId
              ? {
                  ...w,
                  size: {
                    width: Math.max(size.width, w.minSize.width),
                    height: Math.max(size.height, w.minSize.height),
                  },
                }
              : w
          ),
        }));
      },

      // =======================================================================
      // QUERIES
      // =======================================================================

      getWindow: (windowId) => {
        return get().windows.find((w) => w.id === windowId);
      },

      getWindowsByApp: (appId) => {
        return get().windows.filter((w) => w.appId === appId && w.isOpen);
      },

      getActiveWindow: () => {
        const state = get();
        return state.windows.find((w) => w.id === state.activeWindowId);
      },

      getOpenWindows: () => {
        return get().windows.filter((w) => w.isOpen && !w.isMinimized);
      },

      isAppRunning: (appId) => {
        return get().windows.some((w) => w.appId === appId && w.isOpen);
      },

      // =======================================================================
      // UTILITIES
      // =======================================================================

      bringToFront: (windowId) => {
        get().focusWindow(windowId);
      },

      bringAllToFront: (appId) => {
        const state = get();
        const appWindows = state.windows.filter(
          (w) => w.appId === appId && w.isOpen
        );

        if (appWindows.length === 0) return;

        let currentZIndex = state.maxZIndex;
        const updates: Record<string, number> = {};

        appWindows.forEach((w) => {
          currentZIndex += 1;
          updates[w.id] = currentZIndex;
        });

        const lastWindowId = appWindows[appWindows.length - 1].id;

        set((state) => ({
          windows: state.windows.map((w) => ({
            ...w,
            zIndex: updates[w.id] !== undefined ? updates[w.id] : w.zIndex,
            isFocused: w.id === lastWindowId,
          })),
          activeWindowId: lastWindowId,
          maxZIndex: currentZIndex,
        }));
      },

      cascadeWindows: () => {
        const state = get();
        const openWindows = state.windows.filter(
          (w) => w.isOpen && !w.isMinimized
        );

        if (openWindows.length === 0) return;

        const CASCADE_OFFSET = 30;
        const START_X = 100;
        const START_Y = 75; // Below menu bar

        let currentZIndex = state.maxZIndex;

        set((state) => ({
          windows: state.windows.map((w, index) => {
            if (!w.isOpen || w.isMinimized) return w;

            const cascadeIndex = openWindows.findIndex((ow) => ow.id === w.id);
            currentZIndex += 1;

            return {
              ...w,
              position: {
                x: START_X + cascadeIndex * CASCADE_OFFSET,
                y: START_Y + cascadeIndex * CASCADE_OFFSET,
              },
              zIndex: currentZIndex,
              isMaximized: false,
            };
          }),
          maxZIndex: currentZIndex,
        }));

        console.log('[WindowStore] Cascaded windows');
      },

      tileWindows: () => {
        const state = get();
        const openWindows = state.windows.filter(
          (w) => w.isOpen && !w.isMinimized
        );

        if (openWindows.length === 0) return;

        const viewportWidth =
          typeof window !== 'undefined' ? window.innerWidth : 1920;
        const viewportHeight =
          typeof window !== 'undefined' ? window.innerHeight : 1080;

        // Account for menu bar and dock
        const TOP_OFFSET = 25;
        const BOTTOM_OFFSET = 70;
        const PADDING = 10;

        const availableWidth = viewportWidth - PADDING * 2;
        const availableHeight = viewportHeight - TOP_OFFSET - BOTTOM_OFFSET - PADDING;

        // Calculate grid
        const count = openWindows.length;
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);

        const tileWidth = Math.floor(availableWidth / cols) - PADDING;
        const tileHeight = Math.floor(availableHeight / rows) - PADDING;

        let currentZIndex = state.maxZIndex;

        set((state) => ({
          windows: state.windows.map((w) => {
            if (!w.isOpen || w.isMinimized) return w;

            const index = openWindows.findIndex((ow) => ow.id === w.id);
            const col = index % cols;
            const row = Math.floor(index / cols);

            currentZIndex += 1;

            return {
              ...w,
              position: {
                x: PADDING + col * (tileWidth + PADDING),
                y: TOP_OFFSET + PADDING + row * (tileHeight + PADDING),
              },
              size: {
                width: Math.max(tileWidth, w.minSize.width),
                height: Math.max(tileHeight, w.minSize.height),
              },
              zIndex: currentZIndex,
              isMaximized: false,
            };
          }),
          maxZIndex: currentZIndex,
        }));

        console.log('[WindowStore] Tiled windows');
      },

      // =======================================================================
      // PREFERENCES
      // =======================================================================

      setPreference: (key, value) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        }));
      },

      setWallpaper: (url) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            wallpaper: url,
          },
        }));
      },
    }),
    {
      name: 'ruzma-macos-windows',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        preferences: state.preferences,
        // Optionally persist window positions for restoration
        // windows: state.windows,
      }),
    }
  )
);

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook to get just the open windows
 */
export const useOpenWindows = () => useWindowStore((state) => state.getOpenWindows());

/**
 * Hook to get the active window
 */
export const useActiveWindow = () => useWindowStore((state) => state.getActiveWindow());

/**
 * Hook to check if an app is running
 */
export const useIsAppRunning = (appId: string) =>
  useWindowStore((state) => state.isAppRunning(appId));

/**
 * Hook to get windows for a specific app
 */
export const useAppWindows = (appId: string) =>
  useWindowStore((state) => state.getWindowsByApp(appId));

/**
 * Hook to get system preferences
 */
export const useSystemPreferences = () =>
  useWindowStore((state) => state.preferences);
