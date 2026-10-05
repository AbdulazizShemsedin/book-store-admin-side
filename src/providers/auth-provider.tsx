'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types/domain';
import { authService } from '@/lib/auth/auth-service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, pin: string) => Promise<void>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    const hasToken = authService.isAuthenticated();
    if (hasToken) {
      const storedUser = authService.getUser();
      setUser(
        storedUser || {
          id: 'admin-01',
          name: 'Ahmad Hassan',
          role: 'Content Manager',
          email: 'ahmad.hassan@tewba.com',
        }
      );
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  const signin = async (email: string, pin: string) => {
    setIsLoading(true);
    try {
      const profile = await authService.signin(email, pin);
      setUser(profile);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signout = () => {
    authService.signout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        signin,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
