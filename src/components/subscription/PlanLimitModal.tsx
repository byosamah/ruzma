
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { User } from '@supabase/supabase-js';

interface PlanLimitModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  limitType: 'storage' | 'projects';
  currentUsage?: number;
  limit?: number;
}

export const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  user,
  isOpen,
  onClose,
  limitType,
  currentUsage = 0,
  limit = 0,
}) => {
  const { createCheckoutSession, formatStorageSize } = useSubscription(user);

  const handleUpgrade = async () => {
    const checkoutUrl = await createCheckoutSession();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const getTitle = () => {
    switch (limitType) {
      case 'storage':
        return 'Storage Limit Reached';
      case 'projects':
        return 'Project Limit Reached';
      default:
        return 'Upgrade Required';
    }
  };

  const getDescription = () => {
    switch (limitType) {
      case 'storage':
        return `You've reached your storage limit of ${formatStorageSize(limit)}. Upgrade to Plus Tier to get 10 GB of storage.`;
      case 'projects':
        return `You've reached your project limit of ${limit}. Upgrade to Plus Tier to create unlimited projects.`;
      default:
        return 'This feature requires a Plus Tier subscription.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">Plus Tier Benefits:</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 10 GB storage (vs 500 MB)</li>
              <li>• Unlimited projects (vs 2)</li>
              <li>• Branding customization</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpgrade} className="flex-1 bg-amber-500 hover:bg-amber-600">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
