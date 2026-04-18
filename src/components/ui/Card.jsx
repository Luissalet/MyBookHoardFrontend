import React from 'react';

export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
