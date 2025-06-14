
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const AccountSettingsCard = () => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-slate-800">Change Password</h3>
            <p className="text-sm text-slate-600">Update your account password</p>
          </div>
          <Button variant="outline">Update Password</Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-slate-800">Email Notifications</h3>
            <p className="text-sm text-slate-600">Manage your notification preferences</p>
          </div>
          <Button variant="outline">Manage</Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-red-600">Delete Account</h3>
            <p className="text-sm text-slate-600">Permanently delete your account and all data</p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
