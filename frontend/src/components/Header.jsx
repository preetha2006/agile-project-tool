import React from 'react';

export default function Header({ title, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
