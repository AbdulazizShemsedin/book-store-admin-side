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
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const isDemoMode =
      process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
      process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    const hasAuth = authService.isAuthenticated();

    if (hasAuth) {
      const token = authService.getToken();
      // If we are in live mode and the stored token is a fake demo token, purge it
      if (!isDemoMode && (token?.includes('demo') || token?.includes('mock'))) {
        authService.clearLocalSession();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const storedUser = authService.getUser();
      setUser(storedUser);
      setIsAuthenticated(true);
    } else if (isDemoMode) {
      // In demo mode, automatically seed the default demo admin session
      // so stakeholders immediately land on the working admin portal
      const demoUser = {
        id: 'admin',
        name: 'Admin',
        role: 'Administrator',
        email: 'admin@tewba.com',
      };
      authService.saveSession('demo-mock-jwt-token-active', null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tewba_user_profile', JSON.stringify(demoUser));
      }
      setUser(demoUser);
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

  const signout = async () => {
    setIsLoading(true);
    try {
      await authService.signout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push('/login');
    }
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
