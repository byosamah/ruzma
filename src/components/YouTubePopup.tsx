
import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useT } from '@/lib/i18n';

interface YouTubePopupProps {
  videoId?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'default' | 'lg';
}

const YouTubePopup: React.FC<YouTubePopupProps> = ({
  videoId = 'dQw4w9WgXcQ', // Default video ID
  buttonText,
  buttonVariant = 'outline',
  buttonSize = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useT();

  const defaultButtonText = buttonText || t('watchTutorial', 'Watch Tutorial');

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Play className="w-4 h-4" />
        {defaultButtonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              {t('tutorial', 'Tutorial')}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="aspect-video w-full p-6 pt-0">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="Tutorial Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default YouTubePopup;
