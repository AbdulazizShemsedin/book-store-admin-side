import { apiClient } from '@/lib/api/client';
import { AdminSigninRequestBody, AdminSigninResponseBody } from '@/types/api';
import { UserProfile } from '@/types/domain';

const TOKEN_KEY = 'tewba_access_token';
const REFRESH_TOKEN_KEY = 'tewba_refresh_token';
const USER_KEY = 'tewba_user_profile';

/**
 * Authentication service handling login, session persistence, and logout.
 */
class AuthService {
  /**
   * Performs admin sign in using email and password via POST /admin/api/signin.
   * Stores returned JWT token upon successful authentication.
   */
  async signin(email: string, pin: string): Promise<UserProfile> {
    const response = await apiClient.post<AdminSigninResponseBody>(
      '/admin/api/signin',
      { email, password: pin } as AdminSigninRequestBody,
      { skipAuth: true }
    );

    if (response && response.token) {
      this.saveSession(response.token, null);
    }

    const profile: UserProfile = {
      id: 'admin-01',
      name: 'Ahmad Hassan',
      role: 'Content Manager',
      email,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }

    return profile;
  }

  saveSession(token: string, refreshToken: string | null): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  signout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export const authService = new AuthService();
