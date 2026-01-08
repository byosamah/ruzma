/**
 * System Tray Component
 *
 * Right side of the menu bar containing:
 * - Time/Date
 * - Language switcher
 * - Notifications bell
 * - User avatar
 *
 * In RTL mode, this appears on the left side.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bell, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/core/useAuth';
import { useT } from '@/lib/i18n';
import type { Language } from '@/contexts/LanguageContext';

// =============================================================================
// TIME DISPLAY
// =============================================================================

function TimeDisplay() {
  const [time, setTime] = useState(new Date());
  const { dir, language } = useLanguage();
  const isRTL = dir === 'rtl';

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000);

    // Update immediately for accuracy
    setTime(new Date());

    return () => clearInterval(interval);
  }, []);

  // Format time based on language
  const formattedTime = useMemo(() => {
    return time.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, [time, language]);

  // Format date for hover tooltip
  const formattedDate = useMemo(() => {
    return time.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [time, language]);

  return (
    <button
      className={cn(
        'time-display px-2 py-1',
        'text-sm font-medium',
        'hover:bg-black/10 rounded',
        'focus:outline-none',
        'transition-colors duration-75',
        isRTL && 'font-arabic'
      )}
      title={formattedDate}
    >
      {formattedTime}
    </button>
  );
}

// =============================================================================
// LANGUAGE SWITCHER
// =============================================================================

function LanguageSwitcher() {
  const { language, setLanguage, dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  const toggleLanguage = useCallback(() => {
    const newLang: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  }, [language, setLanguage]);

  return (
    <button
      className={cn(
        'language-switcher flex items-center gap-1 px-2 py-1',
        'text-sm font-medium',
        'hover:bg-black/10 rounded',
        'focus:outline-none',
        'transition-colors duration-75'
      )}
      onClick={toggleLanguage}
      title={t('common.switchLanguage') || 'Switch Language'}
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{language}</span>
    </button>
  );
}

// =============================================================================
// NOTIFICATION BELL
// =============================================================================

function NotificationBell() {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // TODO: Get actual notification count
  const notificationCount = 0;

  return (
    <button
      className={cn(
        'notification-bell relative px-2 py-1',
        'hover:bg-black/10 rounded',
        'focus:outline-none',
        'transition-colors duration-75'
      )}
      title={t('common.notifications') || 'Notifications'}
    >
      <Bell className="w-4 h-4" />
      {notificationCount > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5',
            'w-3.5 h-3.5',
            'bg-red-500 text-white',
            'text-[9px] font-bold',
            'rounded-full',
            'flex items-center justify-center',
            isRTL && '-left-0.5 right-auto'
          )}
        >
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  );
}

// =============================================================================
// USER AVATAR
// =============================================================================

function UserAvatar() {
  const { user } = useAuth();
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // Get avatar URL from Google auth or generate initials
  const avatarUrl = useMemo(() => {
    return user?.user_metadata?.avatar_url || null;
  }, [user]);

  // Generate initials from email
  const initials = useMemo(() => {
    if (!user?.email) return '?';
    const parts = user.email.split('@')[0];
    return parts.charAt(0).toUpperCase();
  }, [user]);

  // Generate consistent color from email
  const bgColor = useMemo(() => {
    if (!user?.email) return 'bg-gray-400';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const hash = user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [user]);

  return (
    <button
      className={cn(
        'user-avatar flex items-center px-1.5 py-0.5',
        'hover:bg-black/10 rounded',
        'focus:outline-none',
        'transition-colors duration-75'
      )}
      title={user?.email || 'User'}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-5 h-5 rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            'w-5 h-5 rounded-full',
            'flex items-center justify-center',
            'text-white text-[10px] font-semibold',
            bgColor
          )}
        >
          {initials}
        </div>
      )}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SystemTray() {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div
      className={cn(
        'system-tray flex items-center gap-0.5',
        // In RTL, system tray moves to left side but items stay in same order
        isRTL && 'flex-row-reverse'
      )}
    >
      <NotificationBell />
      <LanguageSwitcher />
      <TimeDisplay />
      <UserAvatar />
    </div>
  );
}

export default SystemTray;
