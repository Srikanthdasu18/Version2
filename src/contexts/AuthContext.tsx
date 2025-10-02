import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { authService, type SignUpData, type SignInData } from '../services/auth.service';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TIMEOUT = 3000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let mounted = true;

    timeoutRef.current = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth check timeout - proceeding without user');
        setLoading(false);
      }
    }, AUTH_TIMEOUT);

    authService.getCurrentUser()
      .then((user) => {
        if (mounted) {
          setUser(user);
          setLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          setLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      });

    const { data } = authService.onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
      }
    });

    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      data.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    const user = await authService.signUp(data);
    setUser(user);
  };

  const signIn = async (data: SignInData) => {
    const user = await authService.signIn(data);
    setUser(user);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = await authService.updateProfile(user.id, updates);
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
