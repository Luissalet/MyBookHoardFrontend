import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to use auth context
 * @throws Error if used outside of AuthProvider
 * @returns {Object} Auth context values
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
