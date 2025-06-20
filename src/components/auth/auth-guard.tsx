'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Language } from '@/types';
import { authService, User } from '@/lib/auth-service';
import { AuthPage } from './auth-page';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  lang: Language;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth',
  '/login',
  '/register',
  '/forgot-password'
];

// Admin routes that use separate authentication
const ADMIN_ROUTES = [
  '/yousef',
  '/admin'
];

export function AuthGuard({ children, lang }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public or admin
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.includes(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.includes(route));

  useEffect(() => {
    checkAuthentication();
  }, [pathname]);

  const checkAuthentication = async () => {
    try {
      // Skip auth check for admin routes (they have their own auth system)
      if (isAdminRoute) {
        setIsLoading(false);
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        handleUnauthenticated();
        return;
      }

      // Verify token with auth service
      const response = await authService.verifyToken(token);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Update user data in localStorage
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        // If user is on auth page but already authenticated, redirect to tests
        if (isPublicRoute) {
          router.push(`/${lang}/tests`);
        }
      } else {
        handleUnauthenticated();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      handleUnauthenticated();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnauthenticated = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear stored auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Don't redirect if already on a public route
    if (!isPublicRoute && !isAdminRoute) {
      router.push(`/${lang}/auth`);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {lang === 'ar' ? 'جاري التحقق من المصادقة...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // Admin routes bypass user authentication
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Show auth page for unauthenticated users on protected routes
  if (!isAuthenticated && !isPublicRoute) {
    return <AuthPage lang={lang} />;
  }

  // Show auth page for public routes when not authenticated
  if (isPublicRoute && !isAuthenticated) {
    return <AuthPage lang={lang} />;
  }

  // Render protected content for authenticated users
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, checkAuthentication }}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth Context for accessing user data throughout the app
import { createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  checkAuthentication: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthGuard');
  }
  return context;
}

// Hook to get current user
export function useUser() {
  const { user } = useAuth();
  return user;
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Hook to logout user
export function useLogout() {
  const router = useRouter();
  
  return async (lang: Language = 'en') => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Redirect to auth page
      router.push(`/${lang}/auth`);
    }
  };
}
