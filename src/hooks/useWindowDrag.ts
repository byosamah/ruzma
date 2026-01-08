/**
 * useWindowDrag Hook
 *
 * Handles window dragging functionality.
 * Tracks mouse movement and updates window position.
 *
 * Features:
 * - Smooth dragging with RAF (requestAnimationFrame)
 * - Boundary constraints (keeps window in viewport)
 * - isDragging state for visual feedback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Position } from '@/types/macos';

// =============================================================================
// TYPES
// =============================================================================

interface UseWindowDragOptions {
  /** Current window position */
  position: Position;
  /** Callback to update position */
  onMove: (position: Position) => void;
  /** Whether dragging is enabled */
  enabled?: boolean;
  /** Minimum Y position (to keep title bar accessible) */
  minY?: number;
}

interface UseWindowDragReturn {
  /** Whether currently dragging */
  isDragging: boolean;
  /** Props to spread on the drag handle element */
  dragHandleProps: {
    onMouseDown: (e: React.MouseEvent) => void;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Minimum distance from viewport edges
const MIN_Y = 0; // Can't go above viewport (title bar must stay visible)
const BUFFER = 50; // Keep at least 50px of window visible

// =============================================================================
// HOOK
// =============================================================================

export function useWindowDrag({
  position,
  onMove,
  enabled = true,
  minY = MIN_Y,
}: UseWindowDragOptions): UseWindowDragReturn {
  // Track dragging state
  const [isDragging, setIsDragging] = useState(false);

  // Store initial mouse position and window position on drag start
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    windowX: number;
    windowY: number;
  } | null>(null);

  // RAF ID for cleanup
  const rafIdRef = useRef<number | null>(null);

  /**
   * Handle mouse down on drag handle
   * Starts the drag operation
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0 || !enabled) return;

      // Prevent default to avoid text selection
      e.preventDefault();

      // Store initial positions
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        windowX: position.x,
        windowY: position.y,
      };

      setIsDragging(true);
    },
    [enabled, position.x, position.y]
  );

  /**
   * Handle mouse move during drag
   * Calculates new position based on mouse delta
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      // Cancel any pending RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Schedule position update
      rafIdRef.current = requestAnimationFrame(() => {
        if (!dragStartRef.current) return;

        // Calculate delta from start position
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;

        // Calculate new position
        let newX = dragStartRef.current.windowX + deltaX;
        let newY = dragStartRef.current.windowY + deltaY;

        // Apply constraints
        // Don't let window go above viewport
        newY = Math.max(minY, newY);

        // Don't let window go too far off screen (keep BUFFER pixels visible)
        const maxX = window.innerWidth - BUFFER;
        const maxY = window.innerHeight - BUFFER;
        newX = Math.max(-window.innerWidth + BUFFER, Math.min(maxX, newX));
        newY = Math.min(maxY, newY);

        // Update position
        onMove({ x: newX, y: newY });
      });
    },
    [isDragging, onMove, minY]
  );

  /**
   * Handle mouse up
   * Ends the drag operation
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;

    // Cancel any pending RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  /**
   * Add/remove global mouse event listeners
   */
  useEffect(() => {
    if (isDragging) {
      // Add listeners to document so we can track mouse outside window
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      // Cleanup RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    dragHandleProps: {
      onMouseDown: handleMouseDown,
    },
  };
}

export default useWindowDrag;
