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
  UserIcon,
  LanguageIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface RegisterFormProps {
  lang: Language;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ lang, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    preferred_language: lang
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const t = getTranslationsSync(lang);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = lang === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = lang === 'ar' ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = lang === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = lang === 'ar' 
        ? 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'
        : 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = lang === 'ar' ? 'تأكيد كلمة المرور مطلوب' : 'Password confirmation is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name.trim(),
        preferred_language: formData.preferred_language as 'en' | 'ar'
      });

      if (response.success && response.user && response.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));

        toast.success(
          lang === 'ar' 
            ? 'تم إنشاء الحساب بنجاح' 
            : 'Account created successfully'
        );

        // Redirect to main application
        router.push(`/${lang}/tests`);
      } else {
        toast.error(
          response.error || 
          (lang === 'ar' ? 'فشل إنشاء الحساب' : 'Account creation failed')
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        lang === 'ar' 
          ? 'حدث خطأ أثناء إنشاء الحساب' 
          : 'An error occurred during registration'
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

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = {
      0: '',
      1: lang === 'ar' ? 'ضعيف جداً' : 'Very Weak',
      2: lang === 'ar' ? 'ضعيف' : 'Weak',
      3: lang === 'ar' ? 'متوسط' : 'Fair',
      4: lang === 'ar' ? 'قوي' : 'Strong',
      5: lang === 'ar' ? 'قوي جداً' : 'Very Strong'
    };

    return { strength, label: labels[strength as keyof typeof labels] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
          <UserIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'ar'
            ? 'أنشئ حسابك للوصول إلى تطبيق اختبارات الألوان'
            : 'Create your account to access the color testing application'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.full_name 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              disabled={isLoading}
            />
          </div>
          {errors.full_name && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.full_name}
            </div>
          )}
        </div>

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

        {/* Preferred Language */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LanguageIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={formData.preferred_language}
              onChange={(e) => handleInputChange('preferred_language', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.strength <= 2 ? 'bg-red-500' :
                      passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
          
          {errors.password && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.password}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.confirmPassword 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              placeholder={lang === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="flex items-center mt-1 text-sm text-green-600">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              {lang === 'ar' ? 'كلمات المرور متطابقة' : 'Passwords match'}
            </div>
          )}
          {errors.confirmPassword && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.confirmPassword}
            </div>
          )}
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
              <span>{lang === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...'}</span>
            </>
          ) : (
            <>
              <UserIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}</span>
            </>
          )}
        </Button>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              disabled={isLoading}
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
