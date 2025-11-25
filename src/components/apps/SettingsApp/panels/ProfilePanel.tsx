/**
 * Profile Panel Component
 *
 * User profile settings panel for the Settings app.
 * Shows: Name, email, company, website, etc.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useT } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ProfilePanel() {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Auth & profile
  const { user } = useAuth();
  const { data: profile } = useProfileQuery(user);

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  // Get avatar URL
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <div className="p-6 space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={avatarUrl || undefined} alt={profile?.full_name || 'User'} />
          <AvatarFallback className="text-2xl bg-gray-200">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">
          {profile?.full_name || t('unnamed') || 'Unnamed'}
        </h2>
        <p className="text-gray-500">{user?.email}</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <ProfileField
            label={t('email') || 'Email'}
            value={user?.email || '-'}
            isRTL={isRTL}
          />
          <ProfileField
            label={t('fullName') || 'Full Name'}
            value={profile?.full_name || '-'}
            isRTL={isRTL}
          />
          <ProfileField
            label={t('company') || 'Company'}
            value={profile?.company || '-'}
            isRTL={isRTL}
          />
          <ProfileField
            label={t('website') || 'Website'}
            value={profile?.website || '-'}
            isRTL={isRTL}
          />
          <ProfileField
            label={t('country') || 'Country'}
            value={profile?.country || '-'}
            isRTL={isRTL}
          />
          <ProfileField
            label={t('currency') || 'Currency'}
            value={profile?.currency || 'USD'}
            isRTL={isRTL}
          />
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardContent className="p-4">
          <div className={cn(
            'flex items-center justify-between',
            isRTL && 'flex-row-reverse'
          )}>
            <span className="text-gray-600">{t('accountType') || 'Account Type'}</span>
            <span className={cn(
              'px-2 py-1 rounded-full text-sm font-medium',
              profile?.user_type === 'pro' 
                ? 'bg-purple-100 text-purple-700'
                : profile?.user_type === 'plus'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            )}>
              {profile?.user_type?.toUpperCase() || 'FREE'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// PROFILE FIELD COMPONENT
// =============================================================================

interface ProfileFieldProps {
  label: string;
  value: string;
  isRTL: boolean;
}

function ProfileField({ label, value, isRTL }: ProfileFieldProps) {
  return (
    <div className={cn(
      'flex items-center justify-between py-2 border-b border-gray-100 last:border-0',
      isRTL && 'flex-row-reverse'
    )}>
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

export default ProfilePanel;
