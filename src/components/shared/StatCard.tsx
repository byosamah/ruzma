import React from 'react';
// Icons replaced with emojis

interface StatCardProps {
  emoji: string;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  emoji,
  title,
  value,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="metric-icon">
          <span className="text-xl">{emoji}</span>
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