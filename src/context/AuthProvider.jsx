import React, { useState, useCallback, useEffect } from 'react';
import * as authAPI from '../services/auth.api';
import { AuthContext } from './AuthContext';

/**
 * AuthProvider
 *
 * Owns the auth state tree for the app and provides `login`, `register`,
 * `logout`, and `checkAuth` to descendants via AuthContext. The
 * non-component `AuthContext` lives in its own module (AuthContext.js) so
 * this file exports only components — a requirement of the
 * `react-refresh/only-export-components` lint rule, and of Fast Refresh.
 *
 * IMPORTANT: All `/auth/*` endpoints return the standard
 * `{ success, data, timestamp }` envelope from `Response::success()`.
 * Axios resolves `response.data === envelope`, so the actual payload
 * lives at `response.data.data`. Tokens use snake_case
 * (`access_token`, `refresh_token`) to match the API.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check authentication status on mount
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');

      // Guard against historical bug: prior code did
      // `localStorage.setItem('user', JSON.stringify(undefined))`
      // which stores the literal string "undefined". Treat that as
      // unauthenticated and clear it.
      const hasValidStoredUser =
        storedUser && storedUser !== 'undefined' && storedUser !== 'null';

      if (hasValidStoredUser && accessToken) {
        // Verify token is still valid by calling /auth/me
        const response = await authAPI.getMe();
        const userData = response.data?.data?.user ?? null;
        if (!userData) {
          throw new Error('Malformed /auth/me response');
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clear any stale poison values
        if (storedUser && !hasValidStoredUser) {
          localStorage.removeItem('user');
        }
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      // Token invalid or expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (identifier, password) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(identifier, password);
      // API shape: { success, data: { access_token, refresh_token, user, ... }, timestamp }
      const payload = response.data?.data;
      if (!payload?.access_token || !payload?.refresh_token || !payload?.user) {
        throw new Error('Malformed login response');
      }
      const { access_token, refresh_token, user: userData } = payload;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return payload;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (username, email, password) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(username, email, password);
      // Same envelope shape as login.
      const payload = response.data?.data;
      if (!payload?.access_token || !payload?.refresh_token || !payload?.user) {
        throw new Error('Malformed register response');
      }
      const { access_token, refresh_token, user: userData } = payload;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return payload;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);
    } catch {
      // Even if logout API fails, clear local state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);

      // Swallow — clearing local state is the real success criterion.
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check auth on component mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
