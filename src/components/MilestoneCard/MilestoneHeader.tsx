
import React, { useState } from 'react';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { formatDateRange } from './utils';
import { Milestone } from './types';
import { FreelancerBranding } from '@/types/branding';
import StatusPill from './StatusPill';
import StatusDropdown from './StatusDropdown';

interface MilestoneHeaderProps {
  milestone: Milestone;
  currency: CurrencyCode;
  branding?: FreelancerBranding | null;
  onStatusChange?: (status: Milestone['status']) => void;
  isClient?: boolean;
}

const MilestoneHeader: React.FC<MilestoneHeaderProps> = ({ 
  milestone, 
  currency,
  branding,
  onStatusChange,
  isClient = false
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const primaryColor = branding?.primary_color || '#4B72E5';
  
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {milestone.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {milestone.description}
          </p>
        </div>
        <div className="ml-4 text-right">
          <div 
            className="text-xl font-bold mb-2"
            style={{ color: primaryColor }}
          >
            {formatCurrency(milestone.price, currency)}
          </div>
          
          {!isClient && onStatusChange ? (
            <StatusDropdown
              milestone={milestone}
              onStatusChange={onStatusChange}
              className="ml-auto"
            />
          ) : (
            <StatusPill 
              status={milestone.status}
              className="ml-auto"
            />
          )}
        </div>
      </div>
      
      {(milestone.start_date || milestone.end_date) && (
        <div className="text-xs text-slate-500">
          📅 {formatDateRange(milestone.start_date, milestone.end_date)}
        </div>
      )}
    </div>
  );
};

export default MilestoneHeader;
