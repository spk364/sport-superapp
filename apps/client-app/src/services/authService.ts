import {
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  AuthUser,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest
} from '../types';

// API base URL - в production это должен быть URL вашего backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Sign in user
   */
  async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      return await this.makeRequest<AuthResponse>('/signin', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('API sign-in failed, using mock response:', error);
      
      // Mock response for development
      if (data.email === 'demo@example.com' && data.password === 'password') {
        const mockUser: AuthUser = {
          id: 'user_001',
          email: data.email,
          firstName: 'Demo',
          lastName: 'User',
          phone: '+7 (900) 123-45-67',
          role: 'client',
          isEmailVerified: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date(),
        };

        return {
          user: mockUser,
          accessToken: 'mock-access-token-12345',
          refreshToken: 'mock-refresh-token-67890',
          expiresIn: 3600,
        };
      }

      // Mock trainer credentials
      if (data.email === 'trainer@example.com' && data.password === 'password') {
        const mockTrainer: AuthUser = {
          id: 'trainer_001',
          email: data.email,
          firstName: 'Alex',
          lastName: 'Trainer',
          phone: '+7 (900) 987-65-43',
          role: 'trainer',
          isEmailVerified: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date(),
        };

        return {
          user: mockTrainer,
          accessToken: 'mock-trainer-token-12345',
          refreshToken: 'mock-trainer-refresh-67890',
          expiresIn: 3600,
        };
      }
      
      throw new Error('Invalid email or password');
    }
  }

  /**
   * Sign up new user
   */
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      return await this.makeRequest<AuthResponse>('/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('API sign-up failed, using mock response:', error);
      
      // Mock response for development
      const mockUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'client',
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        user: mockUser,
        accessToken: `mock-access-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        expiresIn: 3600,
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await this.makeRequest('/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear local storage
      this.clearTokens();
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    try {
      return await this.makeRequest('/password-reset/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Password reset request failed:', error);
      // Mock response for development
      return {
        message: 'If an account with this email exists, you will receive a password reset link.',
      };
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    try {
      return await this.makeRequest('/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw new Error('Invalid or expired reset token');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(data: EmailVerificationRequest): Promise<{ message: string }> {
    try {
      return await this.makeRequest('/verify-email', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Email verification failed:', error);
      throw new Error('Invalid or expired verification token');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      return await this.makeRequest<AuthUser>('/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Get current user failed:', error);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.makeRequest<AuthResponse>('/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      // Update stored tokens
      this.setTokens(response.accessToken, response.refreshToken);
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  /**
   * Token management
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * User management
   */
  setUser(user: AuthUser): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getStoredUser(): AuthUser | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        user.updatedAt = new Date(user.updatedAt);
        return user;
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
    return null;
  }

  clearUser(): void {
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();