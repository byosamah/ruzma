/**
 * Help App Component
 *
 * Help and support window for the macOS interface.
 * Shows contact information and help resources.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, FileText, ExternalLink } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface HelpAppProps {
  /** Window ID (passed by WindowRenderer) */
  windowId?: string;
  /** Optional data passed when opening window */
  data?: Record<string, unknown>;
}

// =============================================================================
// HELP LINKS
// =============================================================================

const helpLinks = [
  {
    id: 'documentation',
    icon: FileText,
    label: 'Documentation',
    labelAr: 'التوثيق',
    description: 'Learn how to use Ruzma',
    descriptionAr: 'تعلم كيفية استخدام رزمة',
    href: '#',
  },
  {
    id: 'contact',
    icon: Mail,
    label: 'Contact Support',
    labelAr: 'تواصل مع الدعم',
    description: 'Get help from our team',
    descriptionAr: 'احصل على مساعدة من فريقنا',
    href: 'mailto:support@ruzma.co',
  },
  {
    id: 'feedback',
    icon: MessageCircle,
    label: 'Send Feedback',
    labelAr: 'إرسال ملاحظات',
    description: 'Share your thoughts',
    descriptionAr: 'شاركنا رأيك',
    href: '#',
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HelpApp({ windowId, data }: HelpAppProps) {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  return (
    <div
      className={cn(
        'help-app h-full overflow-y-auto',
        'bg-gradient-to-b from-blue-50 to-white',
        isRTL && 'text-right'
      )}
      style={{ direction: dir }}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('helpCenter') || 'Help Center'}
          </h1>
          <p className="text-gray-500 mt-2">
            {t('helpDescription') || 'Get help and support for Ruzma'}
          </p>
        </div>

        {/* Help Links */}
        <div className="grid gap-4">
          {helpLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card key={link.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <a
                    href={link.href}
                    className={cn(
                      'flex items-center gap-4',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {isRTL ? link.labelAr : link.label}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isRTL ? link.descriptionAr : link.description}
                      </p>
                    </div>
                    <ExternalLink className={cn(
                      'w-5 h-5 text-gray-400',
                      isRTL && 'rotate-180'
                    )} />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Version Info */}
        <div className="text-center text-sm text-gray-400 pt-4">
          <p>Ruzma v1.0.0</p>
          <p className="mt-1">
            {t('madeWith') || 'Made with'} ❤️ {t('forFreelancers') || 'for freelancers'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelpApp;
