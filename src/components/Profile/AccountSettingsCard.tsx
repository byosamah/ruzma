
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useT } from '@/lib/i18n';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { EmailNotificationsDialog } from './EmailNotificationsDialog';
import { DeleteAccountDialog } from './DeleteAccountDialog';

export const AccountSettingsCard = () => {
  const t = useT();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [emailNotificationsOpen, setEmailNotificationsOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  return (
    <>
      <Card className="border-gray-200 shadow-none bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-gray-900">{t('accountSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex justify-between items-center py-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{t('changePassword')}</h3>
              <p className="text-xs text-gray-500">{t('updatePasswordDesc')}</p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setChangePasswordOpen(true)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {t('updatePassword')}
            </Button>
          </div>

          <Separator className="bg-gray-100" />

          <div className="flex justify-between items-center py-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{t('emailNotifications')}</h3>
              <p className="text-xs text-gray-500">{t('notificationDesc')}</p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setEmailNotificationsOpen(true)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {t('manageNotifications')}
            </Button>
          </div>

          <Separator className="bg-gray-100" />

          <div className="flex justify-between items-center py-3">
            <div>
              <h3 className="text-sm font-medium text-red-600">{t('deleteAccount')}</h3>
              <p className="text-xs text-gray-500">{t('deleteAccountDesc')}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setDeleteAccountOpen(true)}
            >
              {t('deleteAccount')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordDialog 
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      
      <EmailNotificationsDialog 
        open={emailNotificationsOpen}
        onOpenChange={setEmailNotificationsOpen}
      />
      
      <DeleteAccountDialog 
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
      />
    </>
  );
};
