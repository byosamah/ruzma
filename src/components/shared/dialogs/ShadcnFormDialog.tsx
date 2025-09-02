import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface ShadcnFormDialogProps<T extends FieldValues = FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: string;
  description?: string;
}

function ShadcnFormDialog<T extends FieldValues = FieldValues>({
  open,
  onOpenChange,
  title,
  children,
  form,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  maxWidth = 'sm:max-w-md',
  description
}: ShadcnFormDialogProps<T>) {
  const { formState } = form;
  const { isSubmitting, isValid } = formState;

  const handleCancel = () => {
    onCancel?.();
    form.reset();
    onOpenChange(false);
  };

  const handleSubmit = form.handleSubmit(async (data: T) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      // Let the parent component handle errors
      // Error bubbles up for proper handling
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <Form {...form}>
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
                disabled={isSubmitting || !isValid}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { ShadcnFormDialog };