import axiosInstance from '../lib/axios';

const AUTH_BASE = '/auth';

/**
 * Login with identifier and password
 * @param {string} identifier - Username or email
 * @param {string} password - User password
 * @returns {Promise} Login response with tokens and user data
 */
export const login = (identifier, password) => {
  return axiosInstance.post(`${AUTH_BASE}/login`, {
    identifier,
    password,
  });
};

/**
 * Register new user
 * @param {string} username - Username
 * @param {string} email - Email address
 * @param {string} password - User password
 * @returns {Promise} Registration response with tokens and user data
 */
export const register = (username, email, password) => {
  return axiosInstance.post(`${AUTH_BASE}/register`, {
    username,
    email,
    password,
  });
};

/**
 * Logout user
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} Logout response
 */
export const logout = (refreshToken) => {
  return axiosInstance.post(`${AUTH_BASE}/logout`, {
    refreshToken,
  });
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} Response with new access token
 */
export const refreshToken = (refreshToken) => {
  return axiosInstance.post(`${AUTH_BASE}/refresh`, {
    refreshToken,
  });
};

/**
 * Get current user data
 * @returns {Promise} Current user data
 */
export const getMe = () => {
  return axiosInstance.get(`${AUTH_BASE}/me`);
};
