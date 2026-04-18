import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

const toastIcons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
};

const toastStyles = {
  success: 'bg-green-50 border border-green-200 text-green-800',
  error: 'bg-red-50 border border-red-200 text-red-800',
  info: 'bg-blue-50 border border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border border-amber-200 text-amber-800',
};

const toastIconStyles = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-amber-600',
};

function ToastItem({ id, type = 'info', message, onRemove }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div className={`${toastStyles[type]} rounded-lg p-4 mb-3 flex items-start gap-3 min-w-80 max-w-lg shadow-lg`}>
      <div className={toastIconStyles[type]}>
        {toastIcons[type]}
      </div>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    addToast,
    removeToast,
  };

  const toastContainer = (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onRemove={removeToast}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    success: (message) => context.addToast(message, 'success'),
    error: (message) => context.addToast(message, 'error'),
    info: (message) => context.addToast(message, 'info'),
    warning: (message) => context.addToast(message, 'warning'),
  };
}
