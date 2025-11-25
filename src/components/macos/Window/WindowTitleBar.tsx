/**
 * WindowTitleBar Component
 *
 * The draggable title bar at the top of macOS windows.
 * Features:
 * - Frosted glass (blur) background effect
 * - Traffic lights on the left (or right in RTL)
 * - Centered window title
 * - Optional app icon
 * - Double-click to maximize/restore
 * - Acts as drag handle for moving window
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrafficLights } from './TrafficLights';

// =============================================================================
// TYPES
// =============================================================================

interface WindowTitleBarProps {
  /** Window title text */
  title: string;
  /** Arabic title (optional, used in RTL mode) */
  titleAr?: string;
  /** App icon (emoji or component) */
  icon?: React.ReactNode;
  /** Whether the window is focused */
  isFocused?: boolean;
  /** Whether the window is maximized */
  isMaximized?: boolean;
  /** Whether currently dragging (disables traffic light clicks) */
  isDragging?: boolean;
  /** Callback when close button clicked */
  onClose: () => void;
  /** Callback when minimize button clicked */
  onMinimize: () => void;
  /** Callback when maximize button clicked */
  onMaximize: () => void;
  /** Callback when title bar double-clicked */
  onDoubleClick?: () => void;
  /** Props to spread on the title bar for drag handling */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TITLE_BAR_HEIGHT = 38; // Standard macOS title bar height
const TRAFFIC_LIGHTS_MARGIN = 14; // Space from edge to traffic lights

// =============================================================================
// COMPONENT
// =============================================================================

export function WindowTitleBar({
  title,
  titleAr,
  icon,
  isFocused = true,
  isMaximized = false,
  isDragging = false,
  onClose,
  onMinimize,
  onMaximize,
  onDoubleClick,
  dragHandleProps = {},
}: WindowTitleBarProps) {
  // Get language context for RTL support
  const { language, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // Use Arabic title if available and in Arabic mode
  const displayTitle = language === 'ar' && titleAr ? titleAr : title;

  return (
    <div
      className="window-title-bar relative flex items-center select-none"
      style={{
        height: TITLE_BAR_HEIGHT,
        minHeight: TITLE_BAR_HEIGHT,
        // Frosted glass effect - lighter in light mode
        backgroundColor: isFocused
          ? 'rgba(246, 246, 246, 0.85)'
          : 'rgba(246, 246, 246, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        // Subtle bottom border
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        // Round top corners to match window
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        // Cursor changes to indicate draggable
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onDoubleClick={onDoubleClick}
      {...dragHandleProps}
    >
      {/* Traffic lights container - positioned on left (or right in RTL) */}
      <div
        className="absolute flex items-center"
        style={{
          [isRTL ? 'right' : 'left']: TRAFFIC_LIGHTS_MARGIN,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10, // Above title for click handling
        }}
      >
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isFocused={isFocused}
          isMaximized={isMaximized}
          disabled={isDragging}
        />
      </div>

      {/* Title container - centered */}
      <div
        className="flex-1 flex items-center justify-center gap-2 px-20"
        style={{
          // Make title non-selectable and pointer-events none (except for icon)
          pointerEvents: 'none',
        }}
      >
        {/* Optional app icon */}
        {icon && (
          <span
            className="text-base flex-shrink-0"
            style={{
              opacity: isFocused ? 1 : 0.6,
            }}
          >
            {icon}
          </span>
        )}

        {/* Window title */}
        <span
          className="text-[13px] font-medium truncate"
          style={{
            color: isFocused ? '#1d1d1f' : '#8e8e93',
            // Text direction based on language
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {displayTitle}
        </span>
      </div>

      {/* Invisible spacer for traffic lights on opposite side (maintains centering) */}
      <div
        className="absolute"
        style={{
          [isRTL ? 'left' : 'right']: TRAFFIC_LIGHTS_MARGIN,
          width: 52, // Approximate width of traffic lights
        }}
      />
    </div>
  );
}

export default WindowTitleBar;
