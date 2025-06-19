'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth-service';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface LoginFormProps {
  lang: Language;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ lang, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const t = getTranslationsSync(lang);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = lang === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success && response.user && response.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));

        toast.success(
          lang === 'ar' 
            ? 'تم تسجيل الدخول بنجاح' 
            : 'Login successful'
        );

        // Redirect to main application
        router.push(`/${lang}/tests`);
      } else {
        toast.error(
          response.error || 
          (lang === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed')
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        lang === 'ar' 
          ? 'حدث خطأ أثناء تسجيل الدخول' 
          : 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
          <LockClosedIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'ar'
            ? 'أدخل بياناتك للوصول إلى تطبيق اختبارات الألوان'
            : 'Enter your credentials to access the color testing application'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'كلمة المرور' : 'Password'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.password}
            </div>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            disabled={isLoading}
          >
            {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{lang === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}</span>
            </>
          ) : (
            <>
              <LockClosedIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
            </>
          )}
        </Button>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              disabled={isLoading}
            >
              {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create account'}
            </button>
          </p>
        </div>

        {/* Demo Account Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {lang === 'ar' ? 'حساب تجريبي' : 'Demo Account'}
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            {lang === 'ar' 
              ? 'يمكنك استخدام الحساب التجريبي للاختبار:'
              : 'You can use the demo account for testing:'
            }
          </p>
          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <div><strong>Email:</strong> demo@colortest.com</div>
            <div><strong>Password:</strong> demo123</div>
          </div>
        </div>
      </form>
    </div>
  );
}
