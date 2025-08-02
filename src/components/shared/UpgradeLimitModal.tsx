import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/lib/i18n';

interface UpgradeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'project' | 'storage';
  currentPlan?: string;
}

export const UpgradeLimitModal: React.FC<UpgradeLimitModalProps> = ({
  isOpen,
  onClose,
  limitType,
  currentPlan = 'free'
}) => {
  const navigate = useNavigate();
  const t = useT();

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const benefits = {
    plus: [
      'Unlimited projects',
      '10GB storage',
      'Priority support',
      'Advanced analytics'
    ],
    pro: [
      'Unlimited projects',
      '50GB storage', 
      'Premium support',
      'White-label options',
      'API access'
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {limitType === 'project' ? '🚀 ' : '💾 '}
            {limitType === 'project' 
              ? t('projectLimitReached') 
              : t('storageLimitReached')}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {limitType === 'project' 
              ? t('upgradeToCreateMoreProjects')
              : t('upgradeForMoreStorage')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {currentPlan === 'free' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                ✨ {t('upgradeToPlusOrPro')}
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {benefits.plus.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-600">
            <p>{t('currentPlan')}: <strong className="capitalize">{currentPlan}</strong></p>
            {limitType === 'project' && (
              <p className="mt-1">{t('freeProjectLimit')}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleUpgrade}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
          >
            {t('viewUpgradeOptions')} →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};