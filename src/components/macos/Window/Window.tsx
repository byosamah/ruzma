/**
 * Window Component
 *
 * The main macOS-style window component that combines:
 * - Draggable title bar with traffic lights
 * - Resizable edges and corners
 * - Open/close/minimize/maximize animations
 * - Focus management
 *
 * This is the core building block for all app windows in the macOS UI.
 */

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowDrag } from '@/hooks/useWindowDrag';
import { useWindowResize } from '@/hooks/useWindowResize';
import { WindowTitleBar } from './WindowTitleBar';
import { WindowResizeHandles } from './WindowResizeHandles';
import type { WindowState, AppConfig, ResizeDirection } from '@/types/macos';

// Import styles
import '@/styles/macos/macos-window.css';

// =============================================================================
// TYPES
// =============================================================================

interface WindowProps {
  /** Window state from the store */
  windowState: WindowState;
  /** App configuration for this window */
  appConfig: AppConfig;
  /** Children to render in window content area */
  children?: React.ReactNode;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Animation variants for window open/close
const windowVariants = {
  // Initial state (before opening)
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  // Visible state
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  // Exit state (closing)
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Animation for minimize (scale down to dock)
const minimizeVariants = {
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  minimized: {
    opacity: 0,
    scale: 0.2,
    y: '100vh',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 30,
    },
  },
};

// =============================================================================
// LOADING FALLBACK
// =============================================================================

function WindowLoadingFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Window({ windowState, appConfig, children }: WindowProps) {
  const { language } = useLanguage();

  // Get window controls from context
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager();

  // Local state for animation
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Drag hook
  const { isDragging, dragHandleProps } = useWindowDrag({
    position: windowState.position,
    onMove: (position) => moveWindow(windowState.id, position),
    enabled: !windowState.isMaximized, // Can't drag when maximized
  });

  // Resize hook
  const { isResizing, startResize } = useWindowResize({
    position: windowState.position,
    size: windowState.size,
    minSize: windowState.minSize,
    onResize: (position, size) => resizeWindow(windowState.id, position, size),
    enabled: appConfig.resizable && !windowState.isMaximized,
  });

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handle window focus when clicked
   */
  const handleFocus = useCallback(() => {
    if (!windowState.isFocused) {
      focusWindow(windowState.id);
    }
  }, [windowState.id, windowState.isFocused, focusWindow]);

  /**
   * Handle close button
   */
  const handleClose = useCallback(() => {
    closeWindow(windowState.id);
  }, [windowState.id, closeWindow]);

  /**
   * Handle minimize button
   */
  const handleMinimize = useCallback(() => {
    setIsMinimizing(true);
    // After animation completes, actually minimize
    setTimeout(() => {
      minimizeWindow(windowState.id);
      setIsMinimizing(false);
    }, 400);
  }, [windowState.id, minimizeWindow]);

  /**
   * Handle maximize/restore button
   */
  const handleMaximize = useCallback(() => {
    maximizeWindow(windowState.id);
  }, [windowState.id, maximizeWindow]);

  /**
   * Handle title bar double-click (toggle maximize)
   */
  const handleTitleBarDoubleClick = useCallback(() => {
    handleMaximize();
  }, [handleMaximize]);

  /**
   * Handle resize start from handles
   */
  const handleResizeStart = useCallback(
    (direction: ResizeDirection, event: React.MouseEvent) => {
      startResize(direction, event);
    },
    [startResize]
  );

  // ==========================================================================
  // RESTORE ANIMATION
  // ==========================================================================

  // Detect when window is restored from minimized
  useEffect(() => {
    if (!windowState.isMinimized && isRestoring) {
      setIsRestoring(false);
    }
  }, [windowState.isMinimized, isRestoring]);

  // Don't render if minimized (unless animating)
  if (windowState.isMinimized && !isMinimizing && !isRestoring) {
    return null;
  }

  // ==========================================================================
  // POSITION & SIZE STYLES
  // ==========================================================================

  const positionStyles: React.CSSProperties = windowState.isMaximized
    ? {
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }
    : {
        top: windowState.position.y,
        left: windowState.position.x,
        width: windowState.size.width,
        height: windowState.size.height,
      };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  // Get the display title based on language
  const displayTitle =
    language === 'ar' && windowState.titleAr
      ? windowState.titleAr
      : windowState.title;

  return (
    <AnimatePresence>
      {windowState.isOpen && (
        <motion.div
          className={cn(
            'macos-window',
            windowState.isFocused ? 'focused' : 'unfocused',
            windowState.isMaximized && 'maximized',
            isDragging && 'dragging',
            isResizing && 'resizing',
            isMinimizing && 'minimizing'
          )}
          style={{
            ...positionStyles,
            zIndex: windowState.zIndex,
          }}
          variants={isMinimizing ? minimizeVariants : windowVariants}
          initial="hidden"
          animate={isMinimizing ? 'minimized' : 'visible'}
          exit="exit"
          onMouseDown={handleFocus}
          // Hardware acceleration
          layoutId={`window-${windowState.id}`}
        >
          {/* Title Bar */}
          <WindowTitleBar
            title={displayTitle}
            titleAr={windowState.titleAr}
            icon={appConfig.icon}
            isFocused={windowState.isFocused}
            isMaximized={windowState.isMaximized}
            isDragging={isDragging}
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onDoubleClick={handleTitleBarDoubleClick}
            dragHandleProps={dragHandleProps}
          />

          {/* Content Area */}
          <div className="macos-window-content flex-1 overflow-hidden">
            <Suspense fallback={<WindowLoadingFallback />}>
              {children}
            </Suspense>
          </div>

          {/* Resize Handles (only if resizable and not maximized) */}
          {appConfig.resizable && !windowState.isMaximized && (
            <WindowResizeHandles
              resizable={appConfig.resizable}
              onResizeStart={handleResizeStart}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Window;
