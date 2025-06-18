
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap, AlertTriangle } from 'lucide-react';
import { UserSubscription, useSubscription } from '@/hooks/useSubscription';
import { User } from '@supabase/supabase-js';

interface SubscriptionCardProps {
  user: User;
  subscription: UserSubscription;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ user, subscription }) => {
  const { createCheckoutSession, formatStorageSize, getStorageLimit, getProjectLimit } = useSubscription(user);

  const handleUpgrade = async () => {
    const checkoutUrl = await createCheckoutSession();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const storageLimit = getStorageLimit(subscription.user_type);
  const storageUsagePercent = (subscription.storage_used / storageLimit) * 100;
  const projectLimit = getProjectLimit(subscription.user_type);

  const isInGracePeriod = subscription.grace_period_end && new Date(subscription.grace_period_end) > new Date();

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Current Plan
            {subscription.user_type === 'plus' ? (
              <Badge className="bg-amber-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Plus Tier
              </Badge>
            ) : (
              <Badge variant="secondary">Free</Badge>
            )}
          </CardTitle>
          {isInGracePeriod && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Grace Period
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Storage Used</span>
            <span>{formatStorageSize(subscription.storage_used)} / {formatStorageSize(storageLimit)}</span>
          </div>
          <Progress value={storageUsagePercent} className="w-full" />
          {storageUsagePercent > 90 && (
            <p className="text-sm text-amber-600">⚠️ Storage nearly full</p>
          )}
        </div>

        {/* Project Count */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Projects</span>
            <span>
              {subscription.project_count} / {projectLimit === Infinity ? '∞' : projectLimit}
            </span>
          </div>
          {subscription.user_type === 'free' && (
            <Progress value={(subscription.project_count / projectLimit) * 100} className="w-full" />
          )}
          {subscription.user_type === 'free' && subscription.project_count >= projectLimit && (
            <p className="text-sm text-amber-600">⚠️ Project limit reached</p>
          )}
        </div>

        {/* Plan Features */}
        <div className="space-y-3">
          <h4 className="font-medium">Plan Features:</h4>
          {subscription.user_type === 'free' ? (
            <ul className="text-sm space-y-1 text-slate-600">
              <li>• 500 MB storage</li>
              <li>• Up to 2 projects</li>
              <li>• Basic features</li>
            </ul>
          ) : (
            <ul className="text-sm space-y-1 text-slate-600">
              <li>• 10 GB storage</li>
              <li>• Unlimited projects</li>
              <li>• Branding customization</li>
              <li>• Priority support</li>
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t">
          {subscription.user_type === 'free' ? (
            <Button onClick={handleUpgrade} className="w-full bg-amber-500 hover:bg-amber-600">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Plus Tier
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://app.lemonsqueezy.com/my-orders', '_blank')}
              >
                Manage Subscription
              </Button>
              {isInGracePeriod && (
                <Button onClick={handleUpgrade} className="w-full bg-amber-500 hover:bg-amber-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Reactivate Subscription
                </Button>
              )}
            </div>
          )}
        </div>

        {isInGracePeriod && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Your subscription has been cancelled. You have access to Plus features until{' '}
              {new Date(subscription.grace_period_end!).toLocaleDateString()}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
