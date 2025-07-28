import React, { useState } from 'react';
import { ChevronDown, Clock, CheckCircle, XCircle, PlayCircle, PauseCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Milestone } from './types';

interface StatusDropdownProps {
  milestone: Milestone;
  onStatusChange: (status: Milestone['status']) => void;
  className?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  milestone,
  onStatusChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { 
      value: 'pending' as const, 
      label: 'Pending', 
      icon: Clock, 
      color: 'text-yellow-600',
      description: 'Waiting for action'
    },
    { 
      value: 'payment_submitted' as const, 
      label: 'Payment Submitted', 
      icon: AlertCircle, 
      color: 'text-blue-600',
      description: 'Client submitted payment proof'
    },
    { 
      value: 'approved' as const, 
      label: 'Approved', 
      icon: CheckCircle, 
      color: 'text-green-600',
      description: 'Payment approved & delivered'
    },
    { 
      value: 'rejected' as const, 
      label: 'Rejected', 
      icon: XCircle, 
      color: 'text-red-600',
      description: 'Payment proof rejected'
    },
  ];

  const currentStatus = statusOptions.find(s => s.value === milestone.status);

  const handleStatusChange = (newStatus: Milestone['status']) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-3 text-xs font-medium border-dashed hover:border-solid transition-all duration-200",
            className
          )}
        >
          {currentStatus && (
            <currentStatus.icon className={cn("w-3 h-3 mr-1.5", currentStatus.color)} />
          )}
          {currentStatus?.label}
          <ChevronDown className="w-3 h-3 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={cn(
              "flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors",
              milestone.status === option.value && "bg-gray-50"
            )}
          >
            <option.icon className={cn("w-4 h-4 mt-0.5", option.color)} />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">
                {option.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {option.description}
              </div>
            </div>
            {milestone.status === option.value && (
              <div className="w-2 h-2 bg-primary rounded-full mt-1" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;