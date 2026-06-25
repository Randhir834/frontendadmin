'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            // Set auth session if user is already logged in
            sessionStorage.setItem('auth_session', 'active');
          } catch (parseError) {
            // Invalid stored user data - clear it
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('sessionToken');
            sessionStorage.removeItem('auth_session');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((userData: User, token: string, sessionToken?: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    if (sessionToken) {
      localStorage.setItem('sessionToken', sessionToken);
    }
    // Set auth session to prevent redirect loops
    sessionStorage.setItem('auth_session', 'active');
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem('auth_session');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return { user, loading, login, logout, isAuthenticated };
}
