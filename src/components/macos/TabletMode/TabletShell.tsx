/**
 * Tablet Shell Component
 *
 * iPad-like interface for screens 768px - 1023px.
 * Features:
 * - Full-screen app cards (one app at a time)
 * - Simplified menu bar at top
 * - Smaller dock at bottom
 * - Home screen with project grid
 */

import React, { Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/i18n';
import { useDashboard } from '@/hooks/useDashboard';
import { getAppConfig, getDockApps } from '@/lib/macos/windowConfig';
import type { AppConfig } from '@/types/macos';

// Import tablet styles
import '@/styles/macos/macos-tablet.css';

// =============================================================================
// TYPES
// =============================================================================

interface TabletShellProps {
  wallpaper?: string;
}

// =============================================================================
// LOADING FALLBACK
// =============================================================================

function AppLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

// =============================================================================
// TABLET MENU BAR
// =============================================================================

interface TabletMenuBarProps {
  appName?: string;
  appIcon?: string;
  onClose?: () => void;
}

function TabletMenuBar({ appName, appIcon, onClose }: TabletMenuBarProps) {
  const { dir, language, setLanguage } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Get current time
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  });

  // Update time every minute
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [language]);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className={cn('tablet-menu-bar', isRTL && 'flex-row-reverse')}>
      <div className={cn('tablet-menu-bar__left', isRTL && 'flex-row-reverse')}>
        {appName ? (
          <>
            <span className="text-xl">{appIcon}</span>
            <span className="tablet-menu-bar__title">{appName}</span>
          </>
        ) : (
          <span className="tablet-menu-bar__title">
            {isRTL ? 'رزمة' : 'Ruzma'}
          </span>
        )}
      </div>

      <div className={cn('tablet-menu-bar__right', isRTL && 'flex-row-reverse')}>
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          aria-label={t('switchLanguage') || 'Switch Language'}
        >
          {language === 'en' ? 'ع' : 'EN'}
        </button>

        {/* Time */}
        <span className="tablet-menu-bar__time">{time}</span>

        {/* Close button when app is open */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label={t('close') || 'Close'}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// TABLET DOCK
// =============================================================================

interface TabletDockProps {
  apps: AppConfig[];
  activeAppId?: string;
  onOpenApp: (appId: string) => void;
}

function TabletDock({ apps, activeAppId, onOpenApp }: TabletDockProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div className={cn('tablet-dock', isRTL && 'flex-row-reverse')}>
      {apps.map((app, index) => (
        <React.Fragment key={app.id}>
          <button
            className={cn(
              'tablet-dock__item',
              activeAppId === app.id && 'tablet-dock__item--active'
            )}
            onClick={() => onOpenApp(app.id)}
            aria-label={isRTL ? app.nameAr : app.name}
          >
            {app.icon}
          </button>
          {index === apps.length - 2 && <div className="tablet-dock__separator" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// =============================================================================
// TABLET HOME SCREEN
// =============================================================================

interface TabletHomeProps {
  onOpenApp: (appId: string) => void;
  onOpenProject: (slug: string) => void;
}

function TabletHome({ onOpenApp, onOpenProject }: TabletHomeProps) {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';
  const { projects } = useDashboard();

  const dockApps = getDockApps();

  return (
    <div className="tablet-home">
      <div className="tablet-home__grid">
        {/* App Icons */}
        {dockApps.map((app) => (
          <button
            key={app.id}
            className="tablet-home__icon"
            onClick={() => onOpenApp(app.id)}
          >
            <div className="tablet-home__icon-image">{app.icon}</div>
            <span className="tablet-home__icon-label">
              {isRTL ? app.nameAr : app.name}
            </span>
          </button>
        ))}

        {/* Separator for projects */}
        {projects && projects.length > 0 && (
          <div className="col-span-full border-t border-white/10 my-4 pt-4">
            <h3 className="text-white/60 text-sm font-medium mb-4 px-4">
              {t('recentProjects') || 'Recent Projects'}
            </h3>
          </div>
        )}

        {/* Project Folders */}
        {projects?.slice(0, 8).map((project) => (
          <button
            key={project.id}
            className="tablet-home__icon"
            onClick={() => onOpenProject(project.slug)}
          >
            <div className="tablet-home__icon-image">📂</div>
            <span className="tablet-home__icon-label">{project.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// TABLET APP CARD
// =============================================================================

interface TabletAppCardProps {
  app: AppConfig;
  data?: Record<string, unknown>;
  onClose: () => void;
}

function TabletAppCard({ app, data, onClose }: TabletAppCardProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const AppComponent = app.component;

  return (
    <motion.div
      className="tablet-app-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      {/* App Header */}
      <div className={cn('tablet-app-card__header', isRTL && 'flex-row-reverse')}>
        <div className={cn('tablet-app-card__title', isRTL && 'flex-row-reverse')}>
          <span className="tablet-app-card__icon">{app.icon}</span>
          <span>{isRTL ? app.nameAr : app.name}</span>
        </div>
        <button
          className="tablet-app-card__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* App Content */}
      <div className="tablet-app-card__content">
        <Suspense fallback={<AppLoading />}>
          <AppComponent windowId={`tablet-${app.id}`} data={data} />
        </Suspense>
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TabletShell({ wallpaper }: TabletShellProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // State
  const [activeApp, setActiveApp] = useState<{
    config: AppConfig;
    data?: Record<string, unknown>;
  } | null>(null);

  const dockApps = getDockApps();

  // Handle opening an app
  const handleOpenApp = useCallback((appId: string) => {
    const config = getAppConfig(appId);
    if (config) {
      setActiveApp({ config, data: undefined });
    }
  }, []);

  // Handle opening a project
  const handleOpenProject = useCallback((slug: string) => {
    const config = getAppConfig('project');
    if (config) {
      setActiveApp({ config, data: { slug } });
    }
  }, []);

  // Handle closing app
  const handleCloseApp = useCallback(() => {
    setActiveApp(null);
  }, []);

  // Wallpaper style
  const wallpaperStyle = wallpaper
    ? { '--macos-wallpaper': `url(${wallpaper})` }
    : { '--macos-wallpaper': 'linear-gradient(180deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)' };

  return (
    <div
      className="tablet-shell"
      style={wallpaperStyle as React.CSSProperties}
      dir={dir}
    >
      {/* Menu Bar */}
      <TabletMenuBar
        appName={activeApp ? (isRTL ? activeApp.config.nameAr : activeApp.config.name) : undefined}
        appIcon={activeApp?.config.icon}
        onClose={activeApp ? handleCloseApp : undefined}
      />

      {/* Content Area */}
      <div className="tablet-content">
        <AnimatePresence mode="wait">
          {activeApp ? (
            <TabletAppCard
              key={activeApp.config.id}
              app={activeApp.config}
              data={activeApp.data}
              onClose={handleCloseApp}
            />
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <TabletHome
                onOpenApp={handleOpenApp}
                onOpenProject={handleOpenProject}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dock */}
        <TabletDock
          apps={dockApps}
          activeAppId={activeApp?.config.id}
          onOpenApp={handleOpenApp}
        />
      </div>
    </div>
  );
}

export default TabletShell;
