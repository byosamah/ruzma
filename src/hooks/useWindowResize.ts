/**
 * useWindowResize Hook
 *
 * Handles window resizing from edges and corners.
 * Supports 8 resize directions with proper constraints.
 *
 * Features:
 * - Smooth resizing with RAF (requestAnimationFrame)
 * - Minimum size constraints
 * - Maintains window position when resizing from top/left edges
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Position, Size, ResizeDirection } from '@/types/macos';

// =============================================================================
// TYPES
// =============================================================================

interface UseWindowResizeOptions {
  /** Current window position */
  position: Position;
  /** Current window size */
  size: Size;
  /** Minimum allowed size */
  minSize: Size;
  /** Callback to update position and size */
  onResize: (position: Position, size: Size) => void;
  /** Whether resizing is enabled */
  enabled?: boolean;
}

interface UseWindowResizeReturn {
  /** Whether currently resizing */
  isResizing: boolean;
  /** Current resize direction (if resizing) */
  resizeDirection: ResizeDirection | null;
  /** Function to start resize operation */
  startResize: (direction: ResizeDirection, event: React.MouseEvent) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useWindowResize({
  position,
  size,
  minSize,
  onResize,
  enabled = true,
}: UseWindowResizeOptions): UseWindowResizeReturn {
  // Track resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(
    null
  );

  // Store initial values on resize start
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    windowX: number;
    windowY: number;
    windowWidth: number;
    windowHeight: number;
    direction: ResizeDirection;
  } | null>(null);

  // RAF ID for cleanup
  const rafIdRef = useRef<number | null>(null);

  /**
   * Start resize operation
   */
  const startResize = useCallback(
    (direction: ResizeDirection, event: React.MouseEvent) => {
      if (!enabled) return;

      event.preventDefault();
      event.stopPropagation();

      resizeStartRef.current = {
        mouseX: event.clientX,
        mouseY: event.clientY,
        windowX: position.x,
        windowY: position.y,
        windowWidth: size.width,
        windowHeight: size.height,
        direction,
      };

      setResizeDirection(direction);
      setIsResizing(true);
    },
    [enabled, position, size]
  );

  /**
   * Handle mouse move during resize
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;

      // Cancel any pending RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (!resizeStartRef.current) return;

        const {
          mouseX: startMouseX,
          mouseY: startMouseY,
          windowX: startX,
          windowY: startY,
          windowWidth: startWidth,
          windowHeight: startHeight,
          direction,
        } = resizeStartRef.current;

        // Calculate mouse delta
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;

        // Initialize new values
        let newX = startX;
        let newY = startY;
        let newWidth = startWidth;
        let newHeight = startHeight;

        // Handle horizontal resize
        if (direction.includes('e')) {
          // Resizing from east (right edge)
          newWidth = Math.max(minSize.width, startWidth + deltaX);
        } else if (direction.includes('w')) {
          // Resizing from west (left edge)
          // Width decreases as we move left, position moves with it
          const proposedWidth = startWidth - deltaX;
          if (proposedWidth >= minSize.width) {
            newWidth = proposedWidth;
            newX = startX + deltaX;
          } else {
            // Hit minimum width
            newWidth = minSize.width;
            newX = startX + startWidth - minSize.width;
          }
        }

        // Handle vertical resize
        if (direction.includes('s')) {
          // Resizing from south (bottom edge)
          newHeight = Math.max(minSize.height, startHeight + deltaY);
        } else if (direction.includes('n')) {
          // Resizing from north (top edge)
          // Height decreases as we move up, position moves with it
          const proposedHeight = startHeight - deltaY;
          if (proposedHeight >= minSize.height) {
            newHeight = proposedHeight;
            newY = startY + deltaY;
          } else {
            // Hit minimum height
            newHeight = minSize.height;
            newY = startY + startHeight - minSize.height;
          }
        }

        // Ensure window doesn't go off screen
        newX = Math.max(-(newWidth - 50), newX);
        newY = Math.max(0, newY);

        // Update position and size
        onResize({ x: newX, y: newY }, { width: newWidth, height: newHeight });
      });
    },
    [isResizing, minSize, onResize]
  );

  /**
   * Handle mouse up - end resize operation
   */
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
    resizeStartRef.current = null;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  /**
   * Add/remove global event listeners
   */
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Prevent text selection and set appropriate cursor
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    isResizing,
    resizeDirection,
    startResize,
  };
}

export default useWindowResize;
