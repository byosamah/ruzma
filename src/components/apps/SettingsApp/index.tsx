/**
 * Settings App Component
 *
 * macOS System Preferences-style settings window.
 * Features:
 * - Grid of preference icons
 * - Click to navigate to panels
 * - Profile, Branding, Account, Subscription panels
 *
 * This replaces the Profile and Plans pages in macOS mode.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

// Import panel components (lazy loaded for performance)
import { ProfilePanel } from './panels/ProfilePanel';
import { SubscriptionPanel } from './panels/SubscriptionPanel';

// =============================================================================
// TYPES
// =============================================================================

interface SettingsAppProps {
  /** Window ID (passed by WindowRenderer) */
  windowId?: string;
  /** Optional data passed when opening window */
  data?: Record<string, unknown>;
}

type SettingsPanel = 'grid' | 'profile' | 'branding' | 'account' | 'subscription';

interface SettingsItem {
  id: SettingsPanel;
  icon: string;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
}

// =============================================================================
// SETTINGS ITEMS
// =============================================================================

const settingsItems: SettingsItem[] = [
  {
    id: 'profile',
    icon: '👤',
    label: 'Profile',
    labelAr: 'الملف الشخصي',
    description: 'Name, email, and avatar',
    descriptionAr: 'الاسم والبريد والصورة',
  },
  {
    id: 'branding',
    icon: '🎨',
    label: 'Branding',
    labelAr: 'العلامة التجارية',
    description: 'Logo, colors, and style',
    descriptionAr: 'الشعار والألوان والنمط',
  },
  {
    id: 'account',
    icon: '🔐',
    label: 'Account',
    labelAr: 'الحساب',
    description: 'Password and security',
    descriptionAr: 'كلمة المرور والأمان',
  },
  {
    id: 'subscription',
    icon: '💳',
    label: 'Subscription',
    labelAr: 'الاشتراك',
    description: 'Plan and billing',
    descriptionAr: 'الخطة والفواتير',
  },
];

// =============================================================================
// SETTINGS GRID
// =============================================================================

interface SettingsGridProps {
  onSelectPanel: (panel: SettingsPanel) => void;
}

function SettingsGrid({ onSelectPanel }: SettingsGridProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPanel(item.id)}
            className={cn(
              'flex flex-col items-center p-4 rounded-xl',
              'bg-white hover:bg-gray-50',
              'border border-gray-200 hover:border-gray-300',
              'transition-all duration-150',
              'hover:shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
          >
            <span className="text-4xl mb-2">{item.icon}</span>
            <span className="font-medium text-sm text-gray-900">
              {isRTL ? item.labelAr : item.label}
            </span>
            <span className="text-xs text-gray-500 text-center mt-1">
              {isRTL ? item.descriptionAr : item.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// PANEL HEADER
// =============================================================================

interface PanelHeaderProps {
  title: string;
  onBack: () => void;
}

function PanelHeader({ title, onBack }: PanelHeaderProps) {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50',
      isRTL && 'flex-row-reverse'
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1"
      >
        <ChevronLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
        <span>{t('back') || 'Back'}</span>
      </Button>
      <span className="font-medium">{title}</span>
    </div>
  );
}

// =============================================================================
// PLACEHOLDER PANELS
// =============================================================================

function BrandingPanel() {
  const t = useT();
  return (
    <div className="p-6 text-center">
      <span className="text-5xl mb-4 block">🎨</span>
      <h3 className="text-lg font-medium mb-2">{t('branding') || 'Branding'}</h3>
      <p className="text-gray-500">
        {t('brandingComingSoon') || 'Branding customization coming soon'}
      </p>
    </div>
  );
}

function AccountPanel() {
  const t = useT();
  return (
    <div className="p-6 text-center">
      <span className="text-5xl mb-4 block">🔐</span>
      <h3 className="text-lg font-medium mb-2">{t('account') || 'Account'}</h3>
      <p className="text-gray-500">
        {t('accountSettingsComingSoon') || 'Account settings coming soon'}
      </p>
    </div>
  );
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function SettingsLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SettingsApp({ windowId, data }: SettingsAppProps) {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // State
  const [activePanel, setActivePanel] = useState<SettingsPanel>('grid');

  // Auth & profile
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileQuery(user);

  // Handle panel navigation
  const handleSelectPanel = useCallback((panel: SettingsPanel) => {
    setActivePanel(panel);
  }, []);

  const handleBack = useCallback(() => {
    setActivePanel('grid');
  }, []);

  // Get current panel title
  const getPanelTitle = (panel: SettingsPanel): string => {
    const item = settingsItems.find((i) => i.id === panel);
    if (!item) return t('settings') || 'Settings';
    return isRTL ? item.labelAr : item.label;
  };

  // Show loading state
  if (isLoading) {
    return <SettingsLoading />;
  }

  // Render panel content
  const renderPanel = () => {
    switch (activePanel) {
      case 'profile':
        return <ProfilePanel />;
      case 'branding':
        return <BrandingPanel />;
      case 'account':
        return <AccountPanel />;
      case 'subscription':
        return <SubscriptionPanel />;
      default:
        return <SettingsGrid onSelectPanel={handleSelectPanel} />;
    }
  };

  return (
    <div
      className={cn(
        'settings-app h-full flex flex-col',
        'bg-gray-100',
        isRTL && 'text-right'
      )}
      style={{ direction: dir }}
    >
      {/* Panel Header (shown when not on grid) */}
      {activePanel !== 'grid' && (
        <PanelHeader
          title={getPanelTitle(activePanel)}
          onBack={handleBack}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderPanel()}
      </div>
    </div>
  );
}

export default SettingsApp;
