import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/**
 * Modal props
 */
interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

/**
 * Modal Root Component
 */
export function ModalRoot({ open, onOpenChange, children, className }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

/**
 * Modal Trigger Component
 */
export function ModalTrigger({ children, asChild = true }: { 
  children: ReactNode;
  asChild?: boolean;
}) {
  return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
}

/**
 * Modal Content Component
 */
interface ModalContentProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

export function ModalContent({ 
  children, 
  className,
  size = 'md',
  showClose = true
}: ModalContentProps) {
  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-[90vw]'
  };

  return (
    <DialogContent 
      className={cn(sizes[size], className)}
      onPointerDownOutside={(e) => {
        // Prevent closing when clicking outside if showClose is false
        if (!showClose) {
          e.preventDefault();
        }
      }}
    >
      {children}
      {showClose && (
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      )}
    </DialogContent>
  );
}

/**
 * Modal Header Component
 */
export function ModalHeader({ children, className }: { 
  children: ReactNode;
  className?: string;
}) {
  return <DialogHeader className={className}>{children}</DialogHeader>;
}

/**
 * Modal Title Component
 */
export function ModalTitle({ children, className }: { 
  children: ReactNode;
  className?: string;
}) {
  return <DialogTitle className={className}>{children}</DialogTitle>;
}

/**
 * Modal Description Component
 */
export function ModalDescription({ children, className }: { 
  children: ReactNode;
  className?: string;
}) {
  return <DialogDescription className={className}>{children}</DialogDescription>;
}

/**
 * Modal Footer Component
 */
export function ModalFooter({ children, className }: { 
  children: ReactNode;
  className?: string;
}) {
  return <DialogFooter className={className}>{children}</DialogFooter>;
}

/**
 * Modal Close Component
 */
export function ModalClose({ children, asChild = true }: { 
  children: ReactNode;
  asChild?: boolean;
}) {
  return <DialogClose asChild={asChild}>{children}</DialogClose>;
}

/**
 * Complete Modal Component
 */
export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Footer: ModalFooter,
  Close: ModalClose,
};

/**
 * Confirmation Dialog Component
 */
interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  children
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {isLoading ? 'Loading...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Simple Modal wrapper
 */
interface SimpleModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  trigger?: ReactNode;
}

export function SimpleModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  trigger
}: SimpleModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Modal.Trigger>{trigger}</Modal.Trigger>}
      <Modal.Content size={size}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          {description && <Modal.Description>{description}</Modal.Description>}
        </Modal.Header>
        {children}
        {footer && <Modal.Footer>{footer}</Modal.Footer>}
      </Modal.Content>
    </Modal.Root>
  );
}

/**
 * Form Modal wrapper
 */
interface FormModalProps<T> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: (data: T) => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isSubmitting?: boolean;
}

export function FormModal<T = any>({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  size = 'md',
  isSubmitting = false
}: FormModalProps<T>) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size={size} showClose={!isSubmitting}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData) as T;
            await onSubmit(data);
          }}
        >
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            {description && <Modal.Description>{description}</Modal.Description>}
          </Modal.Header>
          
          <div className="py-4">
            {children}
          </div>
          
          <Modal.Footer>
            <Modal.Close>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {cancelText}
              </Button>
            </Modal.Close>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : submitText}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}