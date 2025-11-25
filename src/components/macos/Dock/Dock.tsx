/**
 * Dock Component
 *
 * The macOS-style dock at the bottom of the screen.
 * Features:
 * - Magnification effect on hover
 * - Running indicators for open apps
 * - Click to open/focus apps
 * - Minimized windows appear in dock
 * - Glass morphism background
 */

import React, { useCallback, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { getDockApps } from '@/lib/macos/windowConfig';
import { useWindowStore } from '@/stores/windowStore';
import { DockItem } from './DockItem';
import type { AppConfig, WindowState } from '@/types/macos';

// =============================================================================
// CONSTANTS
// =============================================================================

const DOCK_PADDING = 8;
const DOCK_ITEM_GAP = 4;
const DOCK_RADIUS = 16;

// =============================================================================
// SEPARATOR COMPONENT
// =============================================================================

function DockSeparator() {
  return (
    <div
      className="h-10 w-px bg-white/20 mx-1"
      style={{ alignSelf: 'center' }}
    />
  );
}

// =============================================================================
// MINIMIZED WINDOW ITEM
// =============================================================================

interface MinimizedWindowItemProps {
  windowId: string;
  title: string;
  icon: string;
  mouseX: number | null;
  onClick: () => void;
}

function MinimizedWindowItem({
  windowId,
  title,
  icon,
  mouseX,
  onClick,
}: MinimizedWindowItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="dock-item relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      <motion.div
        className={cn(
          'absolute -top-10 px-3 py-1.5',
          'bg-gray-800/90 text-white text-xs font-medium rounded-md',
          'shadow-lg backdrop-blur-sm',
          'whitespace-nowrap pointer-events-none'
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10,
        }}
      >
        {title}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(31, 41, 55, 0.9)',
          }}
        />
      </motion.div>

      {/* Minimized window thumbnail */}
      <motion.button
        className={cn(
          'relative flex items-center justify-center',
          'rounded-lg overflow-hidden',
          'focus:outline-none'
        )}
        style={{
          width: 48,
          height: 48,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">{icon}</span>
      </motion.button>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function Dock() {
  const dockRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Get dock apps from config
  const dockApps = useMemo(() => getDockApps(), []);

  // Get window manager functions
  const { openApp, focusApp, restoreWindow } = useWindowManager();

  // Get all windows from store (stable reference)
  const windows = useWindowStore((state) => state.windows);

  // Derive minimized windows with useMemo to avoid infinite loop
  const minimizedWindows = useMemo(
    () => windows.filter((w) => w.isMinimized),
    [windows]
  );

  /**
   * Check if an app has any running windows
   */
  const isAppRunning = useCallback(
    (appId: string) => {
      return windows.some(
        (w) => w.appId === appId && w.isOpen && !w.isMinimized
      );
    },
    [windows]
  );

  /**
   * Check if an app has any focused window
   */
  const isAppFocused = useCallback(
    (appId: string) => {
      return windows.some(
        (w) => w.appId === appId && w.isOpen && w.isFocused
      );
    },
    [windows]
  );

  /**
   * Handle mouse move over dock for magnification
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dockRef.current) return;
      const rect = dockRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setMouseX(x);
    },
    []
  );

  /**
   * Handle dock click
   */
  const handleDockItemClick = useCallback(
    (appId: string) => {
      // Check if app is already running
      const running = isAppRunning(appId);

      if (running) {
        // Focus the existing window
        focusApp(appId);
      } else {
        // Open new window
        openApp(appId);
      }
    },
    [isAppRunning, openApp, focusApp]
  );

  /**
   * Handle minimized window click - restore it
   */
  const handleMinimizedClick = useCallback(
    (windowId: string) => {
      restoreWindow(windowId);
    },
    [restoreWindow]
  );

  return (
    <motion.div
      ref={dockRef}
      className={cn(
        'dock fixed bottom-2 left-1/2 -translate-x-1/2',
        'flex items-end',
        'rounded-2xl',
        'pointer-events-auto'
      )}
      style={{
        padding: DOCK_PADDING,
        gap: DOCK_ITEM_GAP,
        // Glass morphism background
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        // Border for definition
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: DOCK_RADIUS,
        // Shadow
        boxShadow: `
          0 4px 6px rgba(0, 0, 0, 0.1),
          0 10px 20px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMouseX(null);
      }}
      // Animate dock appearance
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.2,
      }}
    >
      {/* Main dock apps */}
      {dockApps.map((app, index) => (
        <DockItem
          key={app.id}
          app={app}
          isRunning={isAppRunning(app.id)}
          isFocused={isAppFocused(app.id)}
          mouseX={isHovered ? mouseX : null}
          index={index}
          totalItems={dockApps.length}
          onClick={handleDockItemClick}
        />
      ))}

      {/* Separator before minimized windows (if any) */}
      {minimizedWindows.length > 0 && <DockSeparator />}

      {/* Minimized windows */}
      {minimizedWindows.map((window) => {
        // Get the app icon for this window
        const app = dockApps.find((a) => a.id === window.appId);
        const icon = app?.icon || '📄';

        return (
          <MinimizedWindowItem
            key={window.id}
            windowId={window.id}
            title={window.title}
            icon={icon}
            mouseX={isHovered ? mouseX : null}
            onClick={() => handleMinimizedClick(window.id)}
          />
        );
      })}
    </motion.div>
  );
}

export default Dock;
