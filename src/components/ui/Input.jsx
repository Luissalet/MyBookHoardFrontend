import React from 'react';

export function Input({
  label,
  error,
  type = 'text',
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-900">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 bg-white'
        }`}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
