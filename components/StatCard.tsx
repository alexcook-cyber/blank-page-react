import React from 'react';
import { formatNumber } from '../services/seoService';

interface StatCardProps {
  title: string;
  value: number | string; // Allow raw strings for formatting if needed externally
  badge?: string;
  badgeType?: 'default' | 'success' | 'warning' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, badge, badgeType = 'default' }) => {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  let badgeStyles = "bg-gray-100 text-gray-600";
  if (badgeType === 'success') badgeStyles = "bg-green-50 text-green-700";
  if (badgeType === 'warning') badgeStyles = "bg-yellow-50 text-yellow-700";
  if (badgeType === 'neutral') badgeStyles = "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">{title}</p>
        <h3 className="text-3xl font-bold text-[#0a24e0] tracking-tight">{displayValue}</h3>
      </div>
      
      {badge && (
        <div className="mt-4 flex justify-end">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeStyles}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};