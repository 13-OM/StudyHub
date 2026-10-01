import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services';
import { clearToken, getToken, setToken } from '../services/api';

/**
 * AuthContext — holds the logged in user and the JWT.
 *
 * On first load the stored token is verified against GET /api/auth/me so a
 * page refresh keeps the user logged in (and an expired token is removed).
 */
const AuthContext = createContext(null);
const USER_KEY = 'studyhub_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  }, []);

  // Verify the session once when the application mounts
  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.me();
        persistUser(response.data.user);
      } catch {
        clearToken();
        persistUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [persistUser]);

  const login = useCallback(async (email, password) => {
    const response = await authService.login({ email, password });
    setToken(response.data.token);
    persistUser(response.data.user);
    return response;
  }, [persistUser]);

  const register = useCallback(async (formData) => {
    const response = await authService.register(formData);
    setToken(response.data.token);
    persistUser(response.data.user);
    return response;
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* logging out locally is enough even if the request fails */
    }
    clearToken();
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback((partial) => {
    persistUser({ ...JSON.parse(localStorage.getItem(USER_KEY) || '{}'), ...partial });
  }, [persistUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateUser,
      setUser: persistUser,
    }),
    [user, loading, login, register, logout, updateUser, persistUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
