import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="metric-icon">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="stat-label">{title}</p>
        <p className="stat-number">{value}</p>
        {subtitle && (
          <p className="text-xs text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
};