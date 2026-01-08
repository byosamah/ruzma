/**
 * macOS Desktop Page
 *
 * Responsive macOS-style interface with three modes:
 * - Desktop (1024px+): Full windowed desktop environment
 * - Tablet (768-1023px): iPad-like full-screen app cards
 * - Mobile (<768px): Bottom tab navigation
 */

import React from 'react';
import { useAuth } from '@/hooks/core/useAuth';
import { Navigate } from 'react-router-dom';
import { WindowManagerProvider } from '@/contexts/WindowManagerContext';
import { Desktop } from '@/components/macos/Desktop';
import { TabletShell } from '@/components/macos/TabletMode';
import { MobileShell } from '@/components/macos/MobileMode';
import { useBreakpoint } from '@/hooks/macos/useBreakpoint';
import { useLanguage } from '@/contexts/LanguageContext';

// Import all macOS styles
import '@/styles/macos/index.css';

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function BootScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Apple-style boot logo */}
        <div className="text-6xl mb-4">📊</div>
        <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-white/50 animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// LOCK SCREEN (Authentication)
// =============================================================================

function LockScreen() {
  const { language } = useLanguage();
  return <Navigate to={`/${language}/login`} replace />;
}

// =============================================================================
// APP SHELL (Responsive Shell Selector)
// =============================================================================

function AppShell() {
  const breakpoint = useBreakpoint();

  // Select wallpaper based on preference (could be user-configurable)
  const wallpaper = '/wallpapers/ventura-light.jpg';

  // Render the appropriate shell based on breakpoint
  switch (breakpoint) {
    case 'mobile':
      return <MobileShell />;

    case 'tablet':
      return <TabletShell wallpaper={wallpaper} />;

    case 'desktop':
    default:
      return <Desktop wallpaperId="ventura-light" />;
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MacOSDesktop() {
  const { user, loading, authChecked } = useAuth();

  // Show boot screen while checking authentication
  if (loading || !authChecked) {
    return <BootScreen />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <LockScreen />;
  }

  // Render the responsive app shell
  return (
    <WindowManagerProvider>
      <AppShell />
    </WindowManagerProvider>
  );
}
