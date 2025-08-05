
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n';

interface EmailNotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailNotificationsDialog = ({ open, onOpenChange }: EmailNotificationsDialogProps) => {
  const t = useT();
  const [notifications, setNotifications] = useState({
    projectUpdates: true,
    paymentReminders: true,
    milestoneUpdates: true,
    marketingPromotions: false,
  });

  const handleSave = () => {
    // Here you would save the notification preferences
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('emailNotifications')}</DialogTitle>
          <DialogDescription>
            {t('emailNotificationDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="project-updates" className="text-sm font-medium">
              {t('projectUpdates')}
            </Label>
            <Switch
              id="project-updates"
              checked={notifications.projectUpdates}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, projectUpdates: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="payment-reminders" className="text-sm font-medium">
              {t('paymentReminders')}
            </Label>
            <Switch
              id="payment-reminders"
              checked={notifications.paymentReminders}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, paymentReminders: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="milestone-updates" className="text-sm font-medium">
              {t('milestoneUpdates')}
            </Label>
            <Switch
              id="milestone-updates"
              checked={notifications.milestoneUpdates}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, milestoneUpdates: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing-promotions" className="text-sm font-medium">
              {t('marketingPromotions')}
            </Label>
            <Switch
              id="marketing-promotions"
              checked={notifications.marketingPromotions}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, marketingPromotions: checked }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
