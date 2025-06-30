
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MagicAIButtonProps {
  brief: string;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const MagicAIButton: React.FC<MagicAIButtonProps> = ({
  brief,
  onGenerate,
  isGenerating,
  disabled = false
}) => {
  const t = useT();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClick = () => {
    if (brief.length < 20) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    onGenerate();
  };

  const isDisabled = disabled || isGenerating || brief.length < 20;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isDisabled}
        className="ml-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-1" />
        )}
        {t('magicAI')}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {t('generateWithAI')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t('aiGenerationConfirmation')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>{t('projectBrief')}:</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                {brief}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {t('generateMilestones')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MagicAIButton;
