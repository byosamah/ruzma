
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { getStatusColor, getStatusIcon, formatDateRange } from './utils';
import { Milestone } from './types';
import { FreelancerBranding } from '@/types/branding';

interface MilestoneHeaderProps {
  milestone: Milestone;
  currency: CurrencyCode;
  branding?: FreelancerBranding | null;
}

const MilestoneHeader: React.FC<MilestoneHeaderProps> = ({ 
  milestone, 
  currency,
  branding 
}) => {
  const StatusIcon = getStatusIcon(milestone.status);
  const statusColor = getStatusColor(milestone.status);
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
            className="text-xl font-bold"
            style={{ color: primaryColor }}
          >
            {formatCurrency(milestone.price, currency)}
          </div>
          <Badge 
            variant={statusColor as any} 
            className="mt-1 text-xs"
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1).replace('_', ' ')}
          </Badge>
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
