import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  className,
}) => {
  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  return (
    <div className={cn('p-4 bg-slate-50 rounded-lg', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-800">{title}</span>
        {trend && trendValue && (
          <span className={cn('text-sm font-semibold', trendClasses[trend])}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-slate-600">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
