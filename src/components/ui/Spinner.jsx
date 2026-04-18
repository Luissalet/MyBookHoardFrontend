import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeStyles[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin ${className}`} />
  );
}
