import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BaseFormDialogProps {
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
  maxWidth?: string;
  description?: string;
}

export const BaseFormDialog: React.FC<BaseFormDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled = false,
  maxWidth = 'sm:max-w-md',
  description
}) => {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {children}
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button 
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  );
};