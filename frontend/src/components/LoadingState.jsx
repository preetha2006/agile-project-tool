import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <Loader2 className="w-8 h-8 text-accent-sage animate-spin mb-3" />
      <p className="text-sm text-text-muted font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingState;
