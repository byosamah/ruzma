import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-16 h-16 surface-muted rounded-lg flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-secondary" />
      </div>
      <h3 className="text-base font-medium text-primary mb-2">{title}</h3>
      <p className="text-sm text-secondary mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};