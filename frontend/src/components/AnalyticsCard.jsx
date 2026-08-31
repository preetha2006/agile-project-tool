import React from 'react';

const AnalyticsCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
          
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  trend === 'up' ? 'bg-green-100 text-green-700' : 
                  trend === 'down' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '-'}
                </span>
              )}
              {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-text-muted">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCard;
