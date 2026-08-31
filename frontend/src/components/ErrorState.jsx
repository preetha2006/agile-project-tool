import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = 'Something went wrong', message = 'An error occurred.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-accent-rose/10 rounded-lg border border-accent-rose/30">
      <AlertCircle className="w-10 h-10 text-red-600 mb-3" />
      <h3 className="text-lg font-medium text-red-800 mb-1">{title}</h3>
      <p className="text-sm text-red-600/80 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white text-red-700 text-sm font-medium rounded-md border border-red-200 hover:bg-red-50 transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
