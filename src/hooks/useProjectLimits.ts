
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export const useProjectLimits = (user: User | null) => {
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitType, setLimitType] = useState<'storage' | 'projects'>('projects');
  const { checkUserLimits, subscription } = useSubscription(user);

  const checkProjectCreationLimit = async (): Promise<boolean> => {
    if (!user) return false;

    const canCreate = await checkUserLimits('project');
    if (!canCreate) {
      setLimitType('projects');
      setLimitModalOpen(true);
      toast.error('Project limit reached. Upgrade to Plus Tier for unlimited projects.');
      return false;
    }
    return true;
  };

  const checkStorageLimit = async (fileSize: number): Promise<boolean> => {
    if (!user) return false;

    const canUpload = await checkUserLimits('storage', fileSize);
    if (!canUpload) {
      setLimitType('storage');
      setLimitModalOpen(true);
      toast.error('Storage limit exceeded. Upgrade to Plus Tier for more storage.');
      return false;
    }
    return true;
  };

  const closeLimitModal = () => {
    setLimitModalOpen(false);
  };

  return {
    limitModalOpen,
    limitType,
    subscription,
    checkProjectCreationLimit,
    checkStorageLimit,
    closeLimitModal,
  };
};
