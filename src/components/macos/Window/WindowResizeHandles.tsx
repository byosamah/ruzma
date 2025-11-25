/**
 * WindowResizeHandles Component
 *
 * Provides 8 resize handles around a window (4 edges + 4 corners).
 * Each handle has the appropriate cursor and triggers resize on mousedown.
 *
 * Handle positions:
 * - Edges: n (top), s (bottom), e (right), w (left)
 * - Corners: ne, nw, se, sw
 */

import React from 'react';
import type { ResizeDirection } from '@/types/macos';

// =============================================================================
// TYPES
// =============================================================================

interface WindowResizeHandlesProps {
  /** Whether the window can be resized */
  resizable?: boolean;
  /** Callback when resize starts */
  onResizeStart: (
    direction: ResizeDirection,
    event: React.MouseEvent
  ) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Size of resize handles
const EDGE_SIZE = 4; // Width/height of edge handles
const CORNER_SIZE = 12; // Width/height of corner handles

// Cursor mapping for each resize direction
const CURSOR_MAP: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
};

// =============================================================================
// SUB-COMPONENT
// =============================================================================

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResizeStart: (direction: ResizeDirection, event: React.MouseEvent) => void;
}

/**
 * Individual resize handle
 */
function ResizeHandle({ direction, onResizeStart }: ResizeHandleProps) {
  // Calculate position styles based on direction
  const getPositionStyles = (): React.CSSProperties => {
    const isCorner = direction.length === 2;
    const size = isCorner ? CORNER_SIZE : EDGE_SIZE;

    switch (direction) {
      // Edges
      case 'n':
        return {
          top: 0,
          left: CORNER_SIZE,
          right: CORNER_SIZE,
          height: size,
        };
      case 's':
        return {
          bottom: 0,
          left: CORNER_SIZE,
          right: CORNER_SIZE,
          height: size,
        };
      case 'e':
        return {
          right: 0,
          top: CORNER_SIZE,
          bottom: CORNER_SIZE,
          width: size,
        };
      case 'w':
        return {
          left: 0,
          top: CORNER_SIZE,
          bottom: CORNER_SIZE,
          width: size,
        };

      // Corners
      case 'ne':
        return {
          top: 0,
          right: 0,
          width: size,
          height: size,
        };
      case 'nw':
        return {
          top: 0,
          left: 0,
          width: size,
          height: size,
        };
      case 'se':
        return {
          bottom: 0,
          right: 0,
          width: size,
          height: size,
        };
      case 'sw':
        return {
          bottom: 0,
          left: 0,
          width: size,
          height: size,
        };

      default:
        return {};
    }
  };

  return (
    <div
      className="absolute z-50"
      style={{
        ...getPositionStyles(),
        cursor: CURSOR_MAP[direction],
        // Uncomment below for debugging - shows handle areas
        // backgroundColor: 'rgba(255, 0, 0, 0.2)',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onResizeStart(direction, e);
      }}
      // Prevent text selection during resize
      onSelectCapture={(e) => e.preventDefault()}
    />
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WindowResizeHandles({
  resizable = true,
  onResizeStart,
}: WindowResizeHandlesProps) {
  // Don't render handles if window is not resizable
  if (!resizable) {
    return null;
  }

  // All resize directions
  const directions: ResizeDirection[] = [
    'n',
    's',
    'e',
    'w',
    'ne',
    'nw',
    'se',
    'sw',
  ];

  return (
    <>
      {directions.map((direction) => (
        <ResizeHandle
          key={direction}
          direction={direction}
          onResizeStart={onResizeStart}
        />
      ))}
    </>
  );
}

export default WindowResizeHandles;
