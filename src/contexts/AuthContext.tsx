import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type SignUpData, type SignInData } from '../services/auth.service';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });

    const { data } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    await authService.signUp(data);
    const user = await authService.getCurrentUser();
    setUser(user);
  };

  const signIn = async (data: SignInData) => {
    await authService.signIn(data);
    const user = await authService.getCurrentUser();
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
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
