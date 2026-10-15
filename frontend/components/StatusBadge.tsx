import React from 'react';
import { StudentStatus } from '../types';

interface StatusBadgeProps {
  status: StudentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case StudentStatus.ACTIVE:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
      case StudentStatus.PENDING:
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
      case StudentStatus.EXPIRED:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20';
      case StudentStatus.REJECTED:
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
      case StudentStatus.DEACTIVATED:
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 ring-gray-600/20';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ring-1 ring-inset ${getStyles()} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === StudentStatus.ACTIVE
            ? 'bg-emerald-500'
            : status === StudentStatus.PENDING
            ? 'bg-amber-500'
            : status === StudentStatus.REJECTED
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};
