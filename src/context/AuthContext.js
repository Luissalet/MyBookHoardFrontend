import { createContext } from 'react';

/**
 * AuthContext is intentionally split out from AuthProvider so this
 * module exports only a non-component value. Mixing component and
 * non-component exports trips `react-refresh/only-export-components`
 * and breaks Fast Refresh in dev. Provider lives in `AuthProvider.jsx`.
 */
export const AuthContext = createContext(null);
