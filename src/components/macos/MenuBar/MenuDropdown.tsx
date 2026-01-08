/**
 * Menu Dropdown Component
 *
 * Reusable dropdown menu for the macOS menu bar.
 * Features:
 * - Animated appearance with Framer Motion
 * - Keyboard navigation support
 * - Separator support
 * - Shortcut key display
 * - RTL support
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

// =============================================================================
// TYPES
// =============================================================================

export interface MenuItem {
  /** Unique identifier */
  id: string;
  /** Display label (English) */
  label: string;
  /** Display label (Arabic) */
  labelAr?: string;
  /** Keyboard shortcut (e.g., "⌘Q") */
  shortcut?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Is this a separator? */
  isSeparator?: boolean;
  /** Is this item disabled? */
  disabled?: boolean;
  /** Submenu items (if any) */
  submenu?: MenuItem[];
}

interface MenuDropdownProps {
  /** Menu items to display */
  items: MenuItem[];
  /** Is the dropdown open? */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Custom className */
  className?: string;
  /** Alignment relative to trigger */
  align?: 'left' | 'right';
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// =============================================================================
// MENU ITEM COMPONENT
// =============================================================================

interface MenuItemComponentProps {
  item: MenuItem;
  onClose: () => void;
}

function MenuItemComponent({ item, onClose }: MenuItemComponentProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // Handle click
  const handleClick = () => {
    if (item.disabled || item.isSeparator) return;
    if (item.onClick) {
      item.onClick();
      onClose();
    }
  };

  // Render separator
  if (item.isSeparator) {
    return (
      <div
        className="menu-separator h-px bg-black/10 my-1 mx-3"
        role="separator"
      />
    );
  }

  // Get display label based on language
  const label = isRTL && item.labelAr ? item.labelAr : item.label;

  return (
    <button
      className={cn(
        'menu-item w-full flex items-center gap-2 px-3 py-1.5',
        'text-sm text-gray-900 rounded-md',
        'hover:bg-blue-500 hover:text-white',
        'focus:outline-none focus:bg-blue-500 focus:text-white',
        'transition-colors duration-75',
        item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-900',
        isRTL && 'flex-row-reverse'
      )}
      onClick={handleClick}
      disabled={item.disabled}
      role="menuitem"
    >
      {/* Icon (if provided) */}
      {item.icon && (
        <span className="menu-item-icon w-4 h-4 flex items-center justify-center">
          {item.icon}
        </span>
      )}

      {/* Label */}
      <span className="menu-item-label flex-1 text-left rtl:text-right">
        {label}
      </span>

      {/* Keyboard shortcut */}
      {item.shortcut && (
        <span
          className={cn(
            'menu-item-shortcut text-xs opacity-60',
            'group-hover:opacity-80'
          )}
        >
          {item.shortcut}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MenuDropdown({
  items,
  isOpen,
  onClose,
  className,
  align = 'left',
}: MenuDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // Flip alignment for RTL
  const effectiveAlign = isRTL ? (align === 'left' ? 'right' : 'left') : align;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add listeners with delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className={cn(
            'menu-dropdown absolute top-full mt-0.5',
            'min-w-[200px] py-1',
            // Glass morphism background
            'bg-white/95 backdrop-blur-xl',
            // Border and shadow
            'border border-black/10 rounded-md',
            'shadow-lg shadow-black/20',
            // Position based on alignment
            effectiveAlign === 'left' ? 'left-0' : 'right-0',
            // Z-index to appear above other elements
            'z-50',
            className
          )}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="menu"
        >
          {items.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              onClose={onClose}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MenuDropdown;
