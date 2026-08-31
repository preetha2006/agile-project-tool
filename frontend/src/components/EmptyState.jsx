import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data found', message = 'There is nothing here yet.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-bg-surface rounded-lg border border-border">
      <div className="w-12 h-12 bg-bg-secondary rounded-full flex items-center justify-center mb-4 text-text-muted">
        <Inbox size={24} />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{message}</p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
