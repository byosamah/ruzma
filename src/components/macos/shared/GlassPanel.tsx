/**
 * GlassPanel Component
 *
 * Reusable frosted glass panel with macOS-style blur effect.
 * Used for windows, menus, dock, and other UI elements.
 */

import React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type GlassVariant =
  | 'light'      // Light glass (default)
  | 'dark'       // Dark glass
  | 'dock'       // Dock-specific glass
  | 'menu'       // Menu bar glass
  | 'titlebar'   // Window title bar
  | 'subtle';    // Very subtle glass

export type GlassShadow =
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'window'
  | 'dock'
  | 'elevated';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glass variant style */
  variant?: GlassVariant;
  /** Shadow depth */
  shadow?: GlassShadow;
  /** Add subtle border */
  border?: boolean;
  /** Add inner glow effect */
  glow?: boolean;
  /** Make the panel interactive (hover effects) */
  interactive?: boolean;
  /** Use as a button/clickable element */
  as?: 'div' | 'button';
  /** Children elements */
  children?: React.ReactNode;
}

// =============================================================================
// VARIANT STYLES
// =============================================================================

const variantStyles: Record<GlassVariant, string> = {
  light: 'glass-panel',
  dark: 'glass-panel-dark',
  dock: 'glass-dock',
  menu: 'glass-menu',
  titlebar: 'glass-titlebar',
  subtle: 'bg-white/30 dark:bg-black/30 backdrop-blur-sm',
};

const shadowStyles: Record<GlassShadow, string> = {
  none: '',
  sm: 'shadow-macos-sm',
  md: 'shadow-macos-md',
  lg: 'shadow-macos-lg',
  window: 'shadow-macos-window',
  dock: 'shadow-macos-dock',
  elevated: 'shadow-macos-elevated',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    {
      variant = 'light',
      shadow = 'none',
      border = false,
      glow = false,
      interactive = false,
      as = 'div',
      className,
      children,
      ...props
    },
    ref
  ) {
    const Component = as;

    return (
      <Component
        ref={ref}
        className={cn(
          // Base styles
          'relative',

          // Variant
          variantStyles[variant],

          // Shadow
          shadowStyles[shadow],

          // Border
          border && 'border-macos-subtle',

          // Glow
          glow && 'border-macos-glow',

          // Interactive
          interactive && 'hover-highlight cursor-pointer transition-colors',

          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Glass panel for window content
 */
export function GlassWindow({
  children,
  className,
  ...props
}: Omit<GlassPanelProps, 'variant' | 'shadow'>) {
  return (
    <GlassPanel
      variant="light"
      shadow="window"
      border
      className={cn('rounded-xl overflow-hidden', className)}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

/**
 * Glass panel for menus/dropdowns
 */
export function GlassMenu({
  children,
  className,
  ...props
}: Omit<GlassPanelProps, 'variant' | 'shadow'>) {
  return (
    <GlassPanel
      variant="menu"
      shadow="lg"
      border
      className={cn('rounded-lg', className)}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

/**
 * Glass panel for dock
 */
export function GlassDock({
  children,
  className,
  ...props
}: Omit<GlassPanelProps, 'variant' | 'shadow'>) {
  return (
    <GlassPanel
      variant="dock"
      shadow="dock"
      border
      className={cn('rounded-2xl', className)}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

/**
 * Glass panel for cards
 */
export function GlassCard({
  children,
  className,
  interactive = false,
  ...props
}: Omit<GlassPanelProps, 'variant' | 'shadow'>) {
  return (
    <GlassPanel
      variant="light"
      shadow="md"
      border
      interactive={interactive}
      className={cn('rounded-lg', className)}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

/**
 * Glass button
 */
export function GlassButton({
  children,
  className,
  ...props
}: Omit<GlassPanelProps, 'variant' | 'shadow' | 'as'>) {
  return (
    <GlassPanel
      as="button"
      variant="subtle"
      shadow="sm"
      border
      interactive
      className={cn(
        'rounded-lg px-4 py-2',
        'active:scale-98 transition-transform',
        className
      )}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

export default GlassPanel;
