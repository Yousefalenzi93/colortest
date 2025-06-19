/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

// Browser-compatible crypto functions
const crypto = typeof window !== 'undefined' ? window.crypto : require('crypto');

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  preferred_language: 'en' | 'ar';
  email_verified: boolean;
  created_at: string;
  last_login?: string;
  subscription_type: 'free' | 'premium';
  subscription_status: 'active' | 'cancelled' | 'expired' | 'pending';
  subscription_end_date?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  preferred_language: 'en' | 'ar';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

// Configuration
const JWT_SECRET = 'color-testing-jwt-secret-2025';
const JWT_EXPIRES_IN = '7d';

// Browser-compatible UUID generator
function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simple hash function for browser compatibility
async function hashPassword(password: string): Promise<string> {
  const salt = 'color_testing_salt_2025';
  const combined = password + salt;

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for Node.js environment
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(combined).digest('hex');
}

// Simple JWT implementation for browser compatibility
function createJWT(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (7 * 24 * 60 * 60); // 7 days

  const jwtPayload = { ...payload, iat: now, exp };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(jwtPayload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token: string): any {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = btoa(`${header}.${payload}.${JWT_SECRET}`);

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const decodedPayload = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp < now) {
      throw new Error('Token expired');
    }

    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// In-memory storage (replace with actual database in production)
class AuthService {
  private users: Map<string, any> = new Map();
  private sessions: Map<string, any> = new Map();
  private subscriptions: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    // Create a demo user for testing (using sync hash for initialization)
    const demoUserId = generateUUID();
    const salt = 'color_testing_salt_2025';
    const combined = 'demo123' + salt;

    // Simple sync hash for initialization
    let hashedPassword = '';
    for (let i = 0; i < combined.length; i++) {
      hashedPassword += combined.charCodeAt(i).toString(16);
    }
    
    this.users.set(demoUserId, {
      id: demoUserId,
      email: 'demo@colortest.com',
      password_hash: hashedPassword,
      full_name: 'Demo User',
      preferred_language: 'en',
      email_verified: true,
      created_at: new Date().toISOString(),
      last_login: null,
      is_active: true
    });

    // Create default free subscription for demo user
    this.subscriptions.set(demoUserId, {
      id: generateUUID(),
      user_id: demoUserId,
      subscription_type: 'free',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: null,
      auto_renew: false
    });
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = Array.from(this.users.values()).find(
        user => user.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      // Validate password strength
      if (data.password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const userId = generateUUID();
      const user = {
        id: userId,
        email: data.email.toLowerCase(),
        password_hash: hashedPassword,
        full_name: data.full_name,
        preferred_language: data.preferred_language,
        email_verified: false,
        email_verification_token: generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        is_active: true
      };

      this.users.set(userId, user);

      // Create default free subscription
      const subscriptionId = generateUUID();
      const subscription = {
        id: subscriptionId,
        user_id: userId,
        subscription_type: 'free',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: null,
        auto_renew: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.subscriptions.set(userId, subscription);

      // Generate JWT token
      const token = this.generateToken(userId);

      // Create session
      this.createSession(userId, token);

      return {
        success: true,
        user: this.formatUserResponse(user, subscription),
        token,
        message: 'Registration successful'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = Array.from(this.users.values()).find(
        u => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          error: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const hashedInputPassword = await hashPassword(data.password);
      const isPasswordValid = hashedInputPassword === user.password_hash;
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Update last login
      user.last_login = new Date().toISOString();
      this.users.set(user.id, user);

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Create session
      this.createSession(user.id, token);

      // Get subscription
      const subscription = this.subscriptions.get(user.id);

      return {
        success: true,
        user: this.formatUserResponse(user, subscription),
        token,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Verify JWT token and get user
   */
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = verifyJWT(token);
      const user = this.users.get(decoded.userId);

      if (!user || !user.is_active) {
        return {
          success: false,
          error: 'Invalid or expired token'
        };
      }

      // Check if session exists
      const session = this.sessions.get(token);
      if (!session || session.expires_at < new Date()) {
        return {
          success: false,
          error: 'Session expired'
        };
      }

      // Update session last used
      session.last_used = new Date().toISOString();
      this.sessions.set(token, session);

      // Get subscription
      const subscription = this.subscriptions.get(user.id);

      return {
        success: true,
        user: this.formatUserResponse(user, subscription),
        token
      };

    } catch (error) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Remove session
      this.sessions.delete(token);

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * Get user subscription status
   */
  getUserSubscription(userId: string) {
    return this.subscriptions.get(userId);
  }

  /**
   * Check if user has access to premium features
   */
  hasAccessToPremiumFeatures(userId: string): boolean {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return false;

    return subscription.subscription_type === 'premium' && 
           subscription.status === 'active' &&
           (subscription.end_date === null || new Date(subscription.end_date) > new Date());
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return createJWT({ userId, type: 'access' });
  }

  /**
   * Create user session
   */
  private createSession(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    this.sessions.set(token, {
      id: generateUUID(),
      user_id: userId,
      token_hash: token,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString()
    });
  }

  /**
   * Format user response
   */
  private formatUserResponse(user: any, subscription: any): User {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      preferred_language: user.preferred_language,
      email_verified: user.email_verified,
      created_at: user.created_at,
      last_login: user.last_login,
      subscription_type: subscription?.subscription_type || 'free',
      subscription_status: subscription?.status || 'active',
      subscription_end_date: subscription?.end_date
    };
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values()).map(user => {
      const subscription = this.subscriptions.get(user.id);
      return this.formatUserResponse(user, subscription);
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
