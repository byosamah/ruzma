/**
 * useBreakpoint Hook
 *
 * Detects screen size breakpoints for responsive mode switching.
 * Returns 'desktop' (1024px+), 'tablet' (768-1023px), or 'mobile' (<768px).
 */

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointConfig {
  mobile: { max: number };
  tablet: { min: number; max: number };
  desktop: { min: number };
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const BREAKPOINTS: BreakpointConfig = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024 },
};

// =============================================================================
// HELPER FUNCTION
// =============================================================================

/**
 * Determine breakpoint from window width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.tablet.min) {
    return 'mobile';
  }
  if (width < BREAKPOINTS.desktop.min) {
    return 'tablet';
  }
  return 'desktop';
}

// =============================================================================
// HOOK
// =============================================================================

export function useBreakpoint(): Breakpoint {
  // Initialize with current window width (or default to desktop for SSR)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getBreakpoint(window.innerWidth);
  });

  // Handle resize with debouncing
  const handleResize = useCallback(() => {
    const newBreakpoint = getBreakpoint(window.innerWidth);
    setBreakpoint((prev) => {
      if (prev !== newBreakpoint) {
        return newBreakpoint;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    // Set initial value
    handleResize();

    // Debounced resize handler for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  return breakpoint;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Returns true if current breakpoint is mobile
 */
export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}

/**
 * Returns true if current breakpoint is tablet
 */
export function useIsTablet(): boolean {
  return useBreakpoint() === 'tablet';
}

/**
 * Returns true if current breakpoint is desktop
 */
export function useIsDesktop(): boolean {
  return useBreakpoint() === 'desktop';
}

/**
 * Returns true if current breakpoint is tablet or smaller (not desktop)
 */
export function useIsTouchDevice(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile' || breakpoint === 'tablet';
}

export default useBreakpoint;
