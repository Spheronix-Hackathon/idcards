import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'blue'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'indigo':
        return {
          bg: 'bg-indigo-50 text-indigo-600',
          border: 'border-indigo-100',
          accent: 'from-indigo-600 to-blue-600'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50 text-emerald-600',
          border: 'border-emerald-100',
          accent: 'from-emerald-600 to-teal-600'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 text-amber-600',
          border: 'border-amber-100',
          accent: 'from-amber-600 to-yellow-600'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 text-rose-600',
          border: 'border-rose-100',
          accent: 'from-rose-600 to-red-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 text-purple-600',
          border: 'border-purple-100',
          accent: 'from-purple-600 to-indigo-600'
        };
      default:
        return {
          bg: 'bg-blue-50 text-blue-600',
          border: 'border-blue-100',
          accent: 'from-blue-600 to-cyan-600'
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`relative bg-white rounded-2xl p-6 border ${colors.border} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${colors.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
        )}
      </div>

      {/* Decorative gradient bar at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.accent}`} />
    </div>
  );
};
