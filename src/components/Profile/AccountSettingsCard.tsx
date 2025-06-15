
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useT } from '@/lib/i18n';

export const AccountSettingsCard = () => {
  const t = useT();

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('accountSettings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-slate-800">{t('changePassword')}</h3>
            <p className="text-sm text-slate-600">{t('updatePasswordDesc')}</p>
          </div>
          <Button variant="outline">{t('updatePassword')}</Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-slate-800">{t('emailNotifications')}</h3>
            <p className="text-sm text-slate-600">{t('notificationDesc')}</p>
          </div>
          <Button variant="outline">{t('manageNotifications')}</Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-red-600">{t('deleteAccount')}</h3>
            <p className="text-sm text-slate-600">{t('deleteAccountDesc')}</p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
            {t('deleteAccount')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
