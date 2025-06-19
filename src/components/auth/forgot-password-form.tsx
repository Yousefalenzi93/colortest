'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ForgotPasswordFormProps {
  lang: Language;
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ lang, onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const t = getTranslationsSync(lang);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError(lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success (in real app, this would call your API)
      setIsEmailSent(true);
      toast.success(
        lang === 'ar' 
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور' 
          : 'Password reset link sent successfully'
      );
    } catch (error) {
      console.error('Password reset error:', error);
      setError(
        lang === 'ar' 
          ? 'حدث خطأ أثناء إرسال البريد الإلكتروني' 
          : 'An error occurred while sending the email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'تم إرسال البريد الإلكتروني' : 'Email Sent'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {lang === 'ar'
            ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}. يرجى التحقق من صندوق الوارد الخاص بك.`
            : `A password reset link has been sent to ${email}. Please check your inbox.`
          }
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'ar'
              ? 'لم تتلق البريد الإلكتروني؟ تحقق من مجلد الرسائل غير المرغوب فيها أو حاول مرة أخرى.'
              : "Didn't receive the email? Check your spam folder or try again."
            }
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              {lang === 'ar' ? 'إرسال مرة أخرى' : 'Send Again'}
            </Button>
            
            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to Login'}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
          <EnvelopeIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {lang === 'ar'
            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور'
            : 'Enter your email address and we\'ll send you a password reset link'
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
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                error 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
            </>
          ) : (
            <>
              <EnvelopeIcon className="h-4 w-4" />
              <span>{lang === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}</span>
            </>
          )}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            disabled={isLoading}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'العودة إلى تسجيل الدخول' : 'Back to Login'}</span>
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {lang === 'ar' ? 'تحتاج مساعدة؟' : 'Need Help?'}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {lang === 'ar'
            ? 'إذا كنت تواجه مشاكل في الوصول إلى حسابك، يمكنك التواصل معنا:'
            : 'If you\'re having trouble accessing your account, you can contact us:'
          }
        </p>
        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
          <div>
            <strong>{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> aburakan4551@gmail.com
          </div>
          <div>
            <strong>{lang === 'ar' ? 'الهاتف:' : 'Phone:'}</strong> 00966562294551
          </div>
        </div>
      </div>
    </div>
  );
}
