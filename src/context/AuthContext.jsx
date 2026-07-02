// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {

        
        const token = localStorage.getItem('customer_token');
        const userStr = localStorage.getItem('customer_user');

        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);

        } else {

          setUser(null);
        }
      } catch (error) {

        clearAuthData();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadUser();
  }, []);

  // Verify token with backend (optional but recommended)
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('customer_token');
    if (!token) return false;

    try {
      // Call your verify token endpoint if you have one
      // const response = await axiosInstance.get('/api/auth/verify/');
      // return response.data.valid;
      return true; // Temporary - assume valid
    } catch {
      return false;
    }
  }, []);

  const clearAuthData = () => {

    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = (userData, token) => {

    
    if (!token || !userData) {
      console.error('❌ Invalid login data');
      return false;
    }
    
    try {
      // Store in multiple places for redundancy
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_user', JSON.stringify(userData));
      localStorage.setItem('token', token); // Backup
      localStorage.setItem('user', JSON.stringify(userData)); // Backup
      
      setUser(userData);

      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const logout = () => {

    clearAuthData();
    // Optional: Redirect to login
    window.location.href = '/customer/login';
  };

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('customer_token');
    const hasUser = !!user;
    const isValid = !!token && hasUser;
    

    
    return isValid;
  }, [user]);

  const refreshAuth = useCallback(() => {

    const token = localStorage.getItem('customer_token');
    const userStr = localStorage.getItem('customer_user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
    initialized,
    refreshAuth,
    clearAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};