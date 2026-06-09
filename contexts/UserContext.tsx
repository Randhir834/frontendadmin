'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, UserProfile } from '@/services/userService';

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUserLocally: (updatedUser: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const updateUserLocally = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    // Also update localStorage if it exists
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const profile = await userService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, updateUserLocally }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
