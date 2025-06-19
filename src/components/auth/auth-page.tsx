'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { ForgotPasswordForm } from './forgot-password-form';
import { BeakerIcon } from '@heroicons/react/24/outline';

interface AuthPageProps {
  lang: Language;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export function AuthPage({ lang }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-900 dark:to-secondary-950">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <BeakerIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                {lang === 'ar' 
                  ? 'اختبارات الألوان للكشف عن المخدرات والمؤثرات العقلية'
                  : 'Color Testing for Drug Detection and Psychoactive Substances'
                }
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                {lang === 'ar'
                  ? 'نظام متقدم للكشف عن المواد المخدرة باستخدام الاختبارات الكيميائية اللونية'
                  : 'Advanced system for drug detection using chemical color testing methods'
                }
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    {lang === 'ar' ? 'اختبارات دقيقة وموثوقة' : 'Accurate & Reliable Tests'}
                  </h3>
                  <p className="text-primary-100 text-sm">
                    {lang === 'ar'
                      ? 'مجموعة شاملة من الاختبارات الكيميائية المعتمدة علمياً'
                      : 'Comprehensive collection of scientifically validated chemical tests'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    {lang === 'ar' ? 'واجهة سهلة الاستخدام' : 'User-Friendly Interface'}
                  </h3>
                  <p className="text-primary-100 text-sm">
                    {lang === 'ar'
                      ? 'تصميم بديهي يدعم اللغتين العربية والإنجليزية'
                      : 'Intuitive design with full Arabic and English language support'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">
                    {lang === 'ar' ? 'خطط اشتراك مرنة' : 'Flexible Subscription Plans'}
                  </h3>
                  <p className="text-primary-100 text-sm">
                    {lang === 'ar'
                      ? 'ابدأ مجاناً مع 5 اختبارات أو احصل على الوصول الكامل'
                      : 'Start free with 5 tests or get full access with premium'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <h3 className="font-semibold mb-2">
                {lang === 'ar' ? 'الخطة المجانية تشمل:' : 'Free Plan Includes:'}
              </h3>
              <ul className="text-sm text-primary-100 space-y-1">
                <li>• {lang === 'ar' ? 'اختبار ماركيز للكشف الأساسي' : 'Marquis Test for basic detection'}</li>
                <li>• {lang === 'ar' ? 'اختبار ميك للمواد الأفيونية' : 'Mecke Test for opioids'}</li>
                <li>• {lang === 'ar' ? 'اختبار حمض النيتريك' : 'Nitric Acid Test'}</li>
                <li>• {lang === 'ar' ? 'اختبار كبريتات الحديد' : 'Ferric Sulfate Test'}</li>
                <li>• {lang === 'ar' ? 'اختبار الحشيش' : 'Cannabis Test'}</li>
              </ul>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48" />
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {authMode === 'login' && (
              <LoginForm
                lang={lang}
                onSwitchToRegister={() => setAuthMode('register')}
                onForgotPassword={() => setAuthMode('forgot-password')}
              />
            )}
            
            {authMode === 'register' && (
              <RegisterForm
                lang={lang}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
            
            {authMode === 'forgot-password' && (
              <ForgotPasswordForm
                lang={lang}
                onBackToLogin={() => setAuthMode('login')}
              />
            )}

            {/* Mobile Branding */}
            <div className="lg:hidden mt-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                <BeakerIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {lang === 'ar' 
                  ? 'اختبارات الألوان للكشف عن المخدرات'
                  : 'Color Testing for Drug Detection'
                }
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === 'ar'
                  ? 'نظام متقدم للكشف عن المواد المخدرة'
                  : 'Advanced drug detection system'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
