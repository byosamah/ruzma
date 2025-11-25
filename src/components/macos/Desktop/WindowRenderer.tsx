/**
 * WindowRenderer Component
 *
 * Renders all open windows from the window store.
 * Each window is rendered using the Window component with its
 * corresponding app component loaded inside.
 */

import React, { Suspense, useMemo } from 'react';
import { useWindowStore } from '@/stores/windowStore';
import { getAppConfig } from '@/lib/macos/windowConfig';
import { Window } from '../Window';
import type { WindowState, AppWindowProps } from '@/types/macos';

// =============================================================================
// LOADING FALLBACK
// =============================================================================

function AppLoadingFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading app...</span>
      </div>
    </div>
  );
}

// =============================================================================
// WINDOW WRAPPER
// =============================================================================

interface WindowWrapperProps {
  windowState: WindowState;
}

/**
 * Wrapper that loads the correct app component for a window
 */
function WindowWrapper({ windowState }: WindowWrapperProps) {
  // Get the app config for this window
  const appConfig = useMemo(
    () => getAppConfig(windowState.appId),
    [windowState.appId]
  );

  // If no app config found, don't render
  if (!appConfig) {
    console.warn(`No app config found for appId: ${windowState.appId}`);
    return null;
  }

  // Get the lazy-loaded app component
  const AppComponent = appConfig.component;

  // Props to pass to the app component
  const appProps: AppWindowProps = {
    windowState,
    appConfig,
  };

  return (
    <Window windowState={windowState} appConfig={appConfig}>
      <Suspense fallback={<AppLoadingFallback />}>
        <AppComponent {...appProps} />
      </Suspense>
    </Window>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WindowRenderer() {
  // Get all windows from the store
  const windows = useWindowStore((state) => state.windows);

  // Filter and sort windows by z-index
  const sortedWindows = useMemo(() => {
    return windows
      .filter((w) => w.isOpen && !w.isMinimized) // Only render open, non-minimized windows
      .sort((a, b) => a.zIndex - b.zIndex); // Lower z-index renders first (behind)
  }, [windows]);

  return (
    <div className="macos-window-layer fixed inset-0 pointer-events-none">
      {/* Each window has pointer-events-auto to be interactive */}
      {sortedWindows.map((windowState) => (
        <div key={windowState.id} className="pointer-events-auto">
          <WindowWrapper windowState={windowState} />
        </div>
      ))}
    </div>
  );
}

export default WindowRenderer;
