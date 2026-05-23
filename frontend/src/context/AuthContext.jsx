/**
 * Auth Context
 * Manages user authentication state globally
 * Supports User, Vendor, Admin roles
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('buzzbasket_token');
    const savedUser = localStorage.getItem('buzzbasket_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('buzzbasket_token');
        localStorage.removeItem('buzzbasket_user');
      }
    }
    setLoading(false);
  }, []);

  // Register (supports role: 'user' or 'vendor')
  const register = async (name, email, password, phone, role = 'user') => {
    const { data } = await authAPI.register({ name, email, password, phone, role });
    if (data.success) {
      localStorage.setItem('buzzbasket_token', data.token);
      localStorage.setItem('buzzbasket_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  // Login
  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.success) {
      localStorage.setItem('buzzbasket_token', data.token);
      localStorage.setItem('buzzbasket_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('buzzbasket_token');
    localStorage.removeItem('buzzbasket_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('buzzbasket_user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Role check helpers
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  const value = {
    user,
    loading,
    isAuthenticated,
    isVendor,
    isAdmin,
    isUser,
    register,
    login,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
