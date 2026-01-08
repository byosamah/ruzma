/**
 * TrafficLights Component
 *
 * The iconic macOS window control buttons (close, minimize, maximize).
 * Features:
 * - Red button: Close window
 * - Yellow button: Minimize to dock
 * - Green button: Maximize/fullscreen toggle
 * - Shows symbols (×, −, +) on hover
 * - Dims when window is not focused
 * - RTL support (buttons appear on right side in Arabic)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

// =============================================================================
// TYPES
// =============================================================================

interface TrafficLightsProps {
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Callback when minimize button is clicked */
  onMinimize: () => void;
  /** Callback when maximize button is clicked */
  onMaximize: () => void;
  /** Whether the window is currently focused */
  isFocused?: boolean;
  /** Whether the window is currently maximized */
  isMaximized?: boolean;
  /** Whether to disable the buttons (e.g., during drag) */
  disabled?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Button colors - active state
const COLORS = {
  close: {
    bg: '#FF5F57',
    hover: '#FF3B30',
    symbol: '#4D0000',
  },
  minimize: {
    bg: '#FFBD2E',
    hover: '#FF9500',
    symbol: '#995700',
  },
  maximize: {
    bg: '#28C840',
    hover: '#28CD41',
    symbol: '#006400',
  },
  // Inactive state (window not focused)
  inactive: {
    bg: '#DCDCDC',
    symbol: '#8E8E8E',
  },
};

// Button size
const BUTTON_SIZE = 12;
const BUTTON_GAP = 8;

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TrafficLightButtonProps {
  type: 'close' | 'minimize' | 'maximize';
  onClick: () => void;
  isFocused: boolean;
  isMaximized?: boolean;
  isHovered: boolean;
  disabled: boolean;
}

/**
 * Individual traffic light button
 */
function TrafficLightButton({
  type,
  onClick,
  isFocused,
  isMaximized,
  isHovered,
  disabled,
}: TrafficLightButtonProps) {
  // Get the appropriate color based on focus state
  const colors = COLORS[type];
  const bgColor = isFocused ? colors.bg : COLORS.inactive.bg;
  const symbolColor = isFocused ? colors.symbol : COLORS.inactive.symbol;

  // Determine which symbol to show
  const getSymbol = () => {
    switch (type) {
      case 'close':
        return '×';
      case 'minimize':
        return '−';
      case 'maximize':
        // Show different symbol when maximized (restore vs maximize)
        return isMaximized ? '−' : '+';
      default:
        return '';
    }
  };

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering window drag
        if (!disabled) {
          onClick();
        }
      }}
      className="relative flex items-center justify-center rounded-full focus:outline-none"
      style={{
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        backgroundColor: bgColor,
      }}
      whileHover={
        isFocused && !disabled
          ? {
              backgroundColor: colors.hover,
              scale: 1.05,
            }
          : undefined
      }
      whileTap={
        isFocused && !disabled
          ? {
              scale: 0.95,
            }
          : undefined
      }
      transition={{
        duration: 0.1,
      }}
      aria-label={type}
      disabled={disabled}
    >
      {/* Symbol - only visible on hover */}
      <motion.span
        className="absolute text-[9px] font-bold leading-none select-none"
        style={{
          color: symbolColor,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && isFocused ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      >
        {getSymbol()}
      </motion.span>
    </motion.button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  isFocused = true,
  isMaximized = false,
  disabled = false,
}: TrafficLightsProps) {
  // Track if any button in the group is hovered (macOS shows all symbols on group hover)
  const [isGroupHovered, setIsGroupHovered] = useState(false);

  // Get language direction for RTL support
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div
      className="flex items-center"
      style={{
        gap: BUTTON_GAP,
        // In RTL mode, buttons appear in reverse order (on right side of title bar)
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
    >
      {/* Close button (red) */}
      <TrafficLightButton
        type="close"
        onClick={onClose}
        isFocused={isFocused}
        isHovered={isGroupHovered}
        disabled={disabled}
      />

      {/* Minimize button (yellow) */}
      <TrafficLightButton
        type="minimize"
        onClick={onMinimize}
        isFocused={isFocused}
        isHovered={isGroupHovered}
        disabled={disabled}
      />

      {/* Maximize button (green) */}
      <TrafficLightButton
        type="maximize"
        onClick={onMaximize}
        isFocused={isFocused}
        isMaximized={isMaximized}
        isHovered={isGroupHovered}
        disabled={disabled}
      />
    </div>
  );
}

export default TrafficLights;
