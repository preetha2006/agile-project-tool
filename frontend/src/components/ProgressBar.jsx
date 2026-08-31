import React from 'react';

const ProgressBar = ({ progress = 0, label }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-secondary font-medium">{label}</span>
          <span className="text-text-muted">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent-sage transition-all duration-300 ease-in-out" 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
