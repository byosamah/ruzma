import React, { memo } from 'react';
// Icons replaced with emojis
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-16 h-16 surface-muted rounded-lg flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">{emoji}</span>
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
}

export default memo(EmptyState);