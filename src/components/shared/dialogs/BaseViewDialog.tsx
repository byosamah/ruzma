import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BaseViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  maxWidth?: string;
  maxHeight?: string;
  hideCloseButton?: boolean;
  footer?: React.ReactNode;
  scrollable?: boolean;
}

export const BaseViewDialog = ({
  open,
  onOpenChange,
  title,
  children,
  onClose,
  maxWidth = 'sm:max-w-2xl',
  maxHeight = 'max-h-[80vh]',
  hideCloseButton = false,
  footer,
  scrollable = true
}: BaseViewDialogProps) => {
  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const content = scrollable ? (
    <ScrollArea className={`${maxHeight} pr-4`}>
      {children}
    </ScrollArea>
  ) : (
    <div className={maxHeight}>
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth} hideCloseButton={hideCloseButton}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {content}
        </div>

        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}

        {!footer && onClose && (
          <DialogFooter>
            <Button onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};