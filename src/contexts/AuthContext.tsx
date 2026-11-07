/**
 * DANASI OPPORTUNITY HUB — Authentication Context
 * Founder: NDAYIZEYE Samuel
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserProfile, UserPreferences, UserRole } from '../types/index.ts';
import { api, getStoredToken, setStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  verifyEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
      setProfile(res.profile);
      setPreferences(res.preferences);
    } catch (err) {
      console.warn('[AUTH] Session expired or invalid:', err);
      setStoredToken(null);
      setToken(null);
      setUser(null);
      setProfile(null);
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user as User);
      setProfile(res.profile);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user as User);
      setProfile(res.profile);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setStoredToken(null);
      setToken(null);
      setUser(null);
      setProfile(null);
      setPreferences(null);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    setProfile(res.profile);
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const res = await api.updatePreferences(updates);
    setPreferences(res.preferences);
  };

  const verifyEmail = async () => {
    const res = await api.verifyEmail();
    setUser(res.user);
  };

  const role = user?.role as UserRole | undefined;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        preferences,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        refreshUser,
        verifyEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
