import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'danger' | 'gold';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-[#075B40]/10 text-[#075B40]',
  badge,
  onClick,
}) => {
  const badgeColors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    gold: 'bg-[#D5AC49]/15 text-[#003B2B] border-[#D5AC49]/40',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#075B40]/40' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1 font-display tracking-tight">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${iconBgColor}`}>{icon}</div>
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeColors[badge.variant]}`}
          >
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
