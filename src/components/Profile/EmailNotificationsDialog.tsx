
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';

interface EmailNotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationSettings {
  projectUpdates: boolean;
  paymentReminders: boolean;
  milestoneUpdates: boolean;
  marketing: boolean;
}

export const EmailNotificationsDialog = ({ open, onOpenChange }: EmailNotificationsDialogProps) => {
  const t = useT();
  const [notifications, setNotifications] = useState<NotificationSettings>({
    projectUpdates: true,
    paymentReminders: true,
    milestoneUpdates: true,
    marketing: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching notification settings:', error);
        return;
      }

      // Type-safe cast for Supabase JSON -> NotificationSettings
      if (profile && profile.notification_settings) {
        setNotifications(profile.notification_settings as unknown as NotificationSettings);
      }
    };

    if (open) {
      fetchNotificationSettings();
    }
  }, [open]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsLoading(true);

    try {
      // Double cast to safely convert NotificationSettings to Json
      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: notifications as unknown as any })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Notification preferences updated!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('emailNotifications')}</DialogTitle>
          <DialogDescription>
            Choose which email notifications you'd like to receive.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="project-updates">Project Updates</Label>
            <Switch
              id="project-updates"
              checked={notifications.projectUpdates}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, projectUpdates: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="payment-reminders">Payment Reminders</Label>
            <Switch
              id="payment-reminders"
              checked={notifications.paymentReminders}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, paymentReminders: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="milestone-updates">Milestone Updates</Label>
            <Switch
              id="milestone-updates"
              checked={notifications.milestoneUpdates}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, milestoneUpdates: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing">Marketing & Promotions</Label>
            <Switch
              id="marketing"
              checked={notifications.marketing}
              onCheckedChange={(checked) =>
                setNotifications(prev => ({ ...prev, marketing: checked }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? t('saving') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
