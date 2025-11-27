import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AuthContext = createContext();

// Axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token') || null);

  // Keep Authorization header in sync
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  const setSession = ({ access, refresh, user: userData }) => {
    if (access) {
      localStorage.setItem('access_token', access);
      setAccessToken(access);
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
      setRefreshToken(refresh);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) throw new Error('No refresh token');
    const res = await axios.post('/api/auth/token/refresh/', { refresh: refreshToken });
    const newAccess = res.data?.access;
    const newRefresh = res.data?.refresh;
    setSession({ access: newAccess, refresh: newRefresh });
    return newAccess;
  };

  // Intercept 401s and try one refresh + retry
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (r) => r,
      async (error) => {
        const original = error.config || {};
        const status = error.response?.status;
        const url = original?.url || '';
        const isAuthEndpoint =
          url.includes('/api/auth/token/refresh/') ||
          url.includes('/api/auth/login/') ||
          url.includes('/api/auth/logout/') ||
          url.includes('/api/auth/google/');

        if (status === 401 && !original._retry && refreshToken && !isAuthEndpoint) {
          original._retry = true;
          try {
            const newAccess = await refreshAccessToken();
            original.headers = original.headers || {};
            original.headers['Authorization'] = `Bearer ${newAccess}`;
            return axios(original);
          } catch {
            await logout();
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  const fetchUser = async () => {
    const res = await axios.get('/api/user-data/');
    const userData = res.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  // Add this new method to refresh user data
  const refreshUser = async () => {
    try {
      const userData = await fetchUser();
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  // Initial auth check
  useEffect(() => {
    const init = async () => {
      try {
        if (accessToken) {
          await fetchUser();
        } else if (refreshToken) {
          await refreshAccessToken();
          await fetchUser();
        }
      } catch {
        await logout();
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ access, refresh, user: userData } = {}) => {
    setSession({ access, refresh, user: userData || null });
    try {
      if (!userData) await fetchUser();
    } catch {
      await logout();
      throw new Error('Login failed');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await axios.post('/api/auth/logout/', { refresh: refreshToken });
      }
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    refreshUser, // Export the new method
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
