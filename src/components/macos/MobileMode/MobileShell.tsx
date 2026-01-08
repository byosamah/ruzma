/**
 * Mobile Shell Component
 *
 * Simplified mobile interface for screens < 768px.
 * Features:
 * - Bottom tab bar navigation
 * - Full-screen views
 * - Touch-optimized interactions
 * - iOS-style design patterns
 */

import React, { Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/i18n';
import { getDockApps, getAppConfig } from '@/lib/macos/windowConfig';
import type { AppConfig } from '@/types/macos';

// Import mobile styles
import '@/styles/macos/macos-mobile.css';

// =============================================================================
// TYPES
// =============================================================================

interface MobileShellProps {
  /** Optional callback when user logs out */
  onLogout?: () => void;
}

// =============================================================================
// LOADING FALLBACK
// =============================================================================

function AppLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="mobile-pull-indicator__spinner" />
    </div>
  );
}

// =============================================================================
// MOBILE HEADER
// =============================================================================

interface MobileHeaderProps {
  title: string;
  icon?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

function MobileHeader({ title, icon, showBack, onBack, rightAction }: MobileHeaderProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div className={cn('mobile-header', isRTL && 'flex-row-reverse')}>
      {/* Left/Back */}
      <div className="flex items-center gap-2">
        {showBack && onBack && (
          <button
            className="mobile-header__button"
            onClick={onBack}
            aria-label="Back"
          >
            <ChevronLeft className={cn('w-6 h-6', isRTL && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Title */}
      <div className={cn('mobile-header__title', isRTL && 'flex-row-reverse')}>
        {icon && <span className="mobile-header__icon">{icon}</span>}
        <span>{title}</span>
      </div>

      {/* Right Action */}
      <div className="mobile-header__actions">
        {rightAction}
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE TAB BAR
// =============================================================================

interface MobileTabBarProps {
  tabs: Array<{
    id: string;
    icon: string;
    label: string;
    labelAr: string;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function MobileTabBar({ tabs, activeTab, onTabChange }: MobileTabBarProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div className={cn('mobile-tab-bar', isRTL && 'flex-row-reverse')}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            'mobile-tab-bar__item',
            activeTab === tab.id && 'mobile-tab-bar__item--active'
          )}
          onClick={() => onTabChange(tab.id)}
          aria-label={isRTL ? tab.labelAr : tab.label}
          aria-selected={activeTab === tab.id}
        >
          <span className="mobile-tab-bar__icon">{tab.icon}</span>
          <span className="mobile-tab-bar__label">
            {isRTL ? tab.labelAr : tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// MOBILE VIEW WRAPPER
// =============================================================================

interface MobileViewProps {
  children: React.ReactNode;
  id: string;
}

function MobileView({ children, id }: MobileViewProps) {
  return (
    <motion.div
      key={id}
      className="mobile-content"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MobileShell({ onLogout }: MobileShellProps) {
  const { dir, language, setLanguage } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Get dock apps for tab bar
  const dockApps = getDockApps();

  // Create tabs from dock apps (limit to 5 for mobile)
  const tabs = dockApps.slice(0, 5).map((app) => ({
    id: app.id,
    icon: app.icon,
    label: app.name,
    labelAr: app.nameAr,
  }));

  // State
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'dashboard');
  const [detailView, setDetailView] = useState<{
    appId: string;
    data?: Record<string, unknown>;
  } | null>(null);

  // Get current app config
  const currentApp = getAppConfig(detailView?.appId || activeTab);

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setDetailView(null); // Clear any detail view
  }, []);

  // Handle opening a detail view (e.g., a specific project)
  const handleOpenDetail = useCallback((appId: string, data?: Record<string, unknown>) => {
    setDetailView({ appId, data });
  }, []);

  // Handle going back from detail view
  const handleBack = useCallback(() => {
    setDetailView(null);
  }, []);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Get current view title
  const getCurrentTitle = (): string => {
    if (detailView) {
      const app = getAppConfig(detailView.appId);
      return isRTL ? (app?.nameAr || 'Detail') : (app?.name || 'Detail');
    }
    return isRTL ? (currentApp?.nameAr || 'رزمة') : (currentApp?.name || 'Ruzma');
  };

  // Get current view icon
  const getCurrentIcon = (): string => {
    if (detailView) {
      const app = getAppConfig(detailView.appId);
      return app?.icon || '📄';
    }
    return currentApp?.icon || '📊';
  };

  // Render the app component
  const AppComponent = currentApp?.component;

  return (
    <div className="mobile-shell" dir={dir}>
      {/* Header */}
      <MobileHeader
        title={getCurrentTitle()}
        icon={getCurrentIcon()}
        showBack={!!detailView}
        onBack={handleBack}
        rightAction={
          <button
            className="mobile-header__button"
            onClick={toggleLanguage}
            aria-label={t('switchLanguage') || 'Switch Language'}
          >
            <Globe className="w-5 h-5" />
          </button>
        }
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {detailView ? (
          <MobileView id={`detail-${detailView.appId}`}>
            {AppComponent && (
              <Suspense fallback={<AppLoading />}>
                {React.createElement(
                  getAppConfig(detailView.appId)?.component || AppComponent,
                  {
                    windowId: `mobile-${detailView.appId}`,
                    data: detailView.data,
                  }
                )}
              </Suspense>
            )}
          </MobileView>
        ) : (
          <MobileView id={`tab-${activeTab}`}>
            {AppComponent && (
              <Suspense fallback={<AppLoading />}>
                <AppComponent
                  windowId={`mobile-${activeTab}`}
                  data={undefined}
                />
              </Suspense>
            )}
          </MobileView>
        )}
      </AnimatePresence>

      {/* Tab Bar */}
      <MobileTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}

export default MobileShell;
