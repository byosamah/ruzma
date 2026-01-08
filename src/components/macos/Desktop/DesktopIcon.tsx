/**
 * DesktopIcon Component
 *
 * A desktop icon representing a file, folder, or app shortcut.
 * Features:
 * - Click to select
 * - Double-click to open
 * - macOS-style selection highlight
 * - Drag to move (future enhancement)
 */

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

// =============================================================================
// TYPES
// =============================================================================

export interface DesktopIconData {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Arabic name (optional) */
  nameAr?: string;
  /** Icon (emoji, image URL, or component) */
  icon: React.ReactNode;
  /** Type of icon */
  type: 'folder' | 'app' | 'file';
  /** Grid position */
  position: { row: number; col: number };
  /** Data to pass when opening (e.g., projectId) */
  data?: Record<string, unknown>;
}

interface DesktopIconProps {
  /** Icon data */
  icon: DesktopIconData;
  /** Whether this icon is selected */
  isSelected?: boolean;
  /** Callback when icon is clicked (single click) */
  onClick?: (icon: DesktopIconData) => void;
  /** Callback when icon is double-clicked */
  onDoubleClick?: (icon: DesktopIconData) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ICON_SIZE = 64;
const LABEL_MAX_WIDTH = 80;

// Animation variants
const iconVariants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
  },
  tap: {
    scale: 0.98,
  },
  selected: {
    scale: 1,
  },
};

// =============================================================================
// FOLDER ICON COMPONENT
// =============================================================================

function FolderIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Folder back */}
      <path
        d="M8 16C8 13.7909 9.79086 12 12 12H24L28 16H52C54.2091 16 56 17.7909 56 20V48C56 50.2091 54.2091 52 52 52H12C9.79086 52 8 50.2091 8 48V16Z"
        fill="url(#folderGradient)"
      />
      {/* Folder front */}
      <path
        d="M8 24C8 21.7909 9.79086 20 12 20H52C54.2091 20 56 21.7909 56 24V48C56 50.2091 54.2091 52 52 52H12C9.79086 52 8 50.2091 8 48V24Z"
        fill="url(#folderFrontGradient)"
      />
      <defs>
        <linearGradient
          id="folderGradient"
          x1="32"
          y1="12"
          x2="32"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#64B5F6" />
          <stop offset="1" stopColor="#1E88E5" />
        </linearGradient>
        <linearGradient
          id="folderFrontGradient"
          x1="32"
          y1="20"
          x2="32"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#90CAF9" />
          <stop offset="1" stopColor="#42A5F5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DesktopIcon({
  icon,
  isSelected = false,
  onClick,
  onDoubleClick,
}: DesktopIconProps) {
  const { language } = useLanguage();
  const [lastClickTime, setLastClickTime] = useState(0);

  // Use Arabic name if available and in Arabic mode
  const displayName = language === 'ar' && icon.nameAr ? icon.nameAr : icon.name;

  /**
   * Handle click - detect single vs double click
   */
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;

      if (timeSinceLastClick < 300) {
        // Double click
        onDoubleClick?.(icon);
      } else {
        // Single click
        onClick?.(icon);
      }

      setLastClickTime(now);
    },
    [icon, onClick, onDoubleClick, lastClickTime]
  );

  /**
   * Render the icon based on type
   */
  const renderIcon = () => {
    if (icon.type === 'folder') {
      return <FolderIcon />;
    }
    // For apps and files, render the provided icon
    if (typeof icon.icon === 'string') {
      // Emoji or text
      return <span className="text-5xl">{icon.icon}</span>;
    }
    return icon.icon;
  };

  return (
    <motion.button
      className={cn(
        'desktop-icon',
        'flex flex-col items-center gap-1 p-2 rounded-lg',
        'focus:outline-none',
        'transition-colors duration-150',
        isSelected && 'bg-white/20 backdrop-blur-sm'
      )}
      style={{
        width: LABEL_MAX_WIDTH + 16,
      }}
      variants={iconVariants}
      initial="idle"
      whileHover={!isSelected ? 'hover' : undefined}
      whileTap="tap"
      animate={isSelected ? 'selected' : 'idle'}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          'transition-transform duration-150'
        )}
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
        }}
      >
        {renderIcon()}
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-xs font-medium text-center leading-tight',
          'px-1 py-0.5 rounded',
          // Text shadow for readability on any wallpaper
          'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
          isSelected && 'bg-[#0A84FF] text-white drop-shadow-none'
        )}
        style={{
          maxWidth: LABEL_MAX_WIDTH,
          wordBreak: 'break-word',
          // Limit to 2 lines
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {displayName}
      </span>
    </motion.button>
  );
}

export default DesktopIcon;
