import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusColor, getStatusIcon } from './utils';

interface StatusPillProps {
  status: string;
  onClick?: () => void;
  className?: string;
  isClickable?: boolean;
}

const StatusPill = ({ 
  status, 
  onClick = () => {},
  className = '',
  isClickable = false 
}) => {
  const StatusIcon = getStatusIcon(status);
  const statusColor = getStatusColor(status);
  
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
        statusColor,
        isClickable && "hover:scale-105 cursor-pointer",
        !isClickable && "cursor-default",
        className
      )}
    >
      <StatusIcon className="w-3 h-3" />
      {formatStatus(status)}
    </button>
  );
};

export default StatusPill;