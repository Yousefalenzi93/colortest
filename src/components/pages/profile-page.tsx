'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth, useLogout } from '@/components/auth/auth-guard';
import { subscriptionService } from '@/lib/subscription-service';
import { Button } from '@/components/ui/button';
import {
  UserIcon,
  EnvelopeIcon,
  LanguageIcon,
  StarIcon,
  CreditCardIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ProfilePageProps {
  lang: Language;
}

export function ProfilePage({ lang }: ProfilePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const t = getTranslationsSync(lang);

  if (!user) {
    router.push(`/${lang}/auth`);
    return null;
  }

  const subscriptionStatus = subscriptionService.getSubscriptionStatus(user.id);
  const paymentHistory = subscriptionService.getPaymentHistory(user.id);

  const handleCancelSubscription = async () => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء الاشتراك؟' : 'Are you sure you want to cancel your subscription?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await subscriptionService.cancelSubscription(user.id);
      if (result.success) {
        alert(lang === 'ar' ? 'تم إلغاء الاشتراك بنجاح' : 'Subscription cancelled successfully');
        window.location.reload();
      } else {
        alert(result.error || (lang === 'ar' ? 'خطأ في إلغاء الاشتراك' : 'Error cancelling subscription'));
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert(lang === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?')) {
      await logout(lang);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <UserIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {lang === 'ar' ? 'إدارة حسابك ومعلومات الاشتراك' : 'Manage your account and subscription information'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {lang === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{user.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <LanguageIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lang === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {user.preferred_language === 'ar' ? 'العربية' : 'English'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lang === 'ar' ? 'تاريخ التسجيل' : 'Member Since'}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(user.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {lang === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
                </h2>
                
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          ${payment.amount} {payment.currency}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(payment.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'succeeded' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {payment.status === 'succeeded' 
                          ? (lang === 'ar' ? 'مكتمل' : 'Completed')
                          : (lang === 'ar' ? 'فاشل' : 'Failed')
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subscription Info Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {lang === 'ar' ? 'حالة الاشتراك' : 'Subscription Status'}
              </h2>
              
              <div className="space-y-4">
                <div className={`flex items-center space-x-2 rtl:space-x-reverse p-3 rounded-lg ${
                  subscriptionStatus.type === 'premium' 
                    ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    : 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                }`}>
                  {subscriptionStatus.type === 'premium' ? (
                    <StarIcon className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      subscriptionStatus.type === 'premium' 
                        ? 'text-yellow-900 dark:text-yellow-100'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {subscriptionStatus.type === 'premium' 
                        ? (lang === 'ar' ? 'الخطة المميزة' : 'Premium Plan')
                        : (lang === 'ar' ? 'الخطة المجانية' : 'Free Plan')
                      }
                    </p>
                    {subscriptionStatus.daysRemaining && (
                      <p className={`text-sm ${
                        subscriptionStatus.type === 'premium' 
                          ? 'text-yellow-700 dark:text-yellow-300'
                          : 'text-blue-700 dark:text-blue-300'
                      }`}>
                        {subscriptionStatus.daysRemaining} {lang === 'ar' ? 'يوم متبقي' : 'days remaining'}
                      </p>
                    )}
                  </div>
                </div>

                {subscriptionStatus.canUpgrade ? (
                  <Button
                    onClick={() => router.push(`/${lang}/subscription`)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {lang === 'ar' ? 'ترقية إلى المميز' : 'Upgrade to Premium'}
                  </Button>
                ) : subscriptionStatus.type === 'premium' && (
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {isLoading 
                      ? (lang === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...')
                      : (lang === 'ar' ? 'إلغاء الاشتراك' : 'Cancel Subscription')
                    }
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h2>
              
              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/${lang}/tests`)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {lang === 'ar' ? 'عرض الاختبارات' : 'View Tests'}
                </Button>

                <Button
                  onClick={() => router.push(`/${lang}/subscription`)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CreditCardIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {lang === 'ar' ? 'إدارة الاشتراك' : 'Manage Subscription'}
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {lang === 'ar' ? 'تسجيل خروج' : 'Logout'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
