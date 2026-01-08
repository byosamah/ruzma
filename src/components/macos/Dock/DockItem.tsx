/**
 * DockItem Component
 *
 * Individual item in the macOS dock.
 * Features:
 * - Hover magnification effect
 * - Bounce animation when app launches
 * - Running indicator dot
 * - Tooltip on hover
 * - Click to open/focus app
 */

import React, { useCallback, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AppConfig } from '@/types/macos';

// =============================================================================
// TYPES
// =============================================================================

interface DockItemProps {
  /** App configuration */
  app: AppConfig;
  /** Whether the app is currently running (has open windows) */
  isRunning?: boolean;
  /** Whether this app's window is currently focused */
  isFocused?: boolean;
  /** Whether the app is launching (bounce animation) */
  isLaunching?: boolean;
  /** Mouse X position relative to dock center (for magnification) */
  mouseX: number | null;
  /** Index position in the dock */
  index: number;
  /** Total number of items in dock */
  totalItems: number;
  /** Callback when item is clicked */
  onClick?: (appId: string) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BASE_ICON_SIZE = 48;
const MAX_ICON_SIZE = 72;
const MAGNIFICATION_RANGE = 150; // Pixels from icon center to affect magnification

// =============================================================================
// COMPONENT
// =============================================================================

export function DockItem({
  app,
  isRunning = false,
  isFocused = false,
  isLaunching = false,
  mouseX,
  index,
  totalItems,
  onClick,
}: DockItemProps) {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  // Display name based on language
  const displayName = language === 'ar' ? app.nameAr : app.name;

  // Calculate this item's center X position
  // This is approximate - in real implementation would use ref measurement
  const itemCenterX = index * (BASE_ICON_SIZE + 8) + BASE_ICON_SIZE / 2;

  // Calculate magnification based on mouse distance
  const calculateMagnification = useCallback(() => {
    if (mouseX === null) return BASE_ICON_SIZE;

    const distance = Math.abs(mouseX - itemCenterX);
    if (distance > MAGNIFICATION_RANGE) return BASE_ICON_SIZE;

    // Smooth magnification curve
    const magnification = 1 - distance / MAGNIFICATION_RANGE;
    const sizeIncrease = (MAX_ICON_SIZE - BASE_ICON_SIZE) * magnification;

    return BASE_ICON_SIZE + sizeIncrease;
  }, [mouseX, itemCenterX]);

  // Spring animation for smooth size changes
  const iconSize = useSpring(calculateMagnification(), {
    stiffness: 400,
    damping: 30,
  });

  /**
   * Handle click
   */
  const handleClick = useCallback(() => {
    onClick?.(app.id);
  }, [app.id, onClick]);

  return (
    <motion.div
      className="dock-item relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip - appears above icon on hover */}
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
        transition={{ duration: 0.15 }}
      >
        {displayName}
        {/* Tooltip arrow */}
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

      {/* Icon button */}
      <motion.button
        className={cn(
          'dock-icon relative flex items-center justify-center',
          'rounded-xl overflow-hidden',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          'transition-shadow duration-200',
          isFocused && 'ring-2 ring-white/30'
        )}
        style={{
          width: iconSize,
          height: iconSize,
          // Subtle glass effect
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        // Bounce animation when launching
        animate={
          isLaunching
            ? {
                y: [0, -20, 0, -10, 0],
                transition: {
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: 'loop',
                },
              }
            : {}
        }
      >
        {/* App icon */}
        <span className="text-3xl">{app.icon}</span>
      </motion.button>

      {/* Running indicator dot */}
      <motion.div
        className={cn(
          'absolute -bottom-1.5',
          'w-1 h-1 rounded-full bg-white/80'
        )}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: isRunning ? 1 : 0,
          scale: isRunning ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

export default DockItem;
