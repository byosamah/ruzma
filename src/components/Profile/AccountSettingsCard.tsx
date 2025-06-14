
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const AccountSettingsCard = () => {
  return (
    <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-brand-navy">Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-brand-navy">Change Password</h3>
            <p className="text-sm text-brand-navy/70">Update your account password</p>
          </div>
          <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white shadow-md">Update Password</Button>
        </div>

        <Separator className="bg-brand-blue/20" />

        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-brand-navy">Email Notifications</h3>
            <p className="text-sm text-brand-navy/70">Manage your notification preferences</p>
          </div>
          <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white shadow-md">Manage</Button>
        </div>

        <Separator className="bg-brand-blue/20" />

        <div className="flex justify-between items-center py-3">
          <div>
            <h3 className="font-medium text-red-600">Delete Account</h3>
            <p className="text-sm text-brand-navy/70">Permanently delete your account and all data</p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 shadow-md">
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
