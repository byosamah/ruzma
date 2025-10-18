
import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/core/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailNotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationSettings {
  projectUpdates: boolean;
  paymentReminders: boolean;
  milestoneUpdates: boolean;
  marketingPromotions: boolean;
}

export const EmailNotificationsDialog = ({ open, onOpenChange }: EmailNotificationsDialogProps) => {
  const t = useT();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSettings>({
    projectUpdates: true,
    paymentReminders: true,
    milestoneUpdates: true,
    marketingPromotions: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load notification settings from database when dialog opens
  useEffect(() => {
    if (open && user) {
      loadNotificationSettings();
    }
  }, [open, user]);

  const loadNotificationSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // If settings exist in database, use them
      if (data?.notification_settings) {
        const settings = data.notification_settings as NotificationSettings;
        setNotifications(settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: notifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Notification settings saved successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
            </div>
          ) : (
            <>
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? t('saving') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
