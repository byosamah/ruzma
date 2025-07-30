import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled = false
}) => {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {children}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting || submitDisabled}
            className="min-w-[80px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};