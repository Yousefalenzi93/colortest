'use client';

import { useState } from 'react';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { subscriptionService, SUBSCRIPTION_PLANS } from '@/lib/subscription-service';
import { useAuth } from '@/components/auth/auth-guard';
import toast from 'react-hot-toast';
import {
  CheckIcon,
  StarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BeakerIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface SubscriptionPlansProps {
  lang: Language;
  onSubscriptionChange?: () => void;
}

export function SubscriptionPlans({ lang, onSubscriptionChange }: SubscriptionPlansProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const t = getTranslationsSync(lang);

  const handleUpgradeToPremium = async () => {
    if (!user) return;

    setIsLoading('premium');
    
    try {
      // Simulate payment processing
      const paymentResult = await subscriptionService.processPayment(user.id, 10, 'USD');
      
      if (paymentResult.success) {
        // Create premium subscription
        const subscriptionResult = await subscriptionService.createPremiumSubscription(user.id, {
          amount: 10,
          currency: 'USD',
          payment_method: 'card',
          stripe_subscription_id: paymentResult.payment_intent_id
        });

        if (subscriptionResult.success) {
          toast.success(
            lang === 'ar' 
              ? 'تم الاشتراك في الخطة المميزة بنجاح!' 
              : 'Successfully upgraded to Premium!'
          );
          
          // Trigger subscription change callback
          onSubscriptionChange?.();
          
          // Refresh the page to update subscription status
          window.location.reload();
        } else {
          throw new Error(subscriptionResult.error);
        }
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(
        lang === 'ar' 
          ? 'فشل في معالجة الاشتراك. يرجى المحاولة مرة أخرى.' 
          : 'Failed to process subscription. Please try again.'
      );
    } finally {
      setIsLoading(null);
    }
  };

  const currentSubscription = user ? subscriptionService.getUserSubscription(user.id) : null;
  const subscriptionStatus = user ? subscriptionService.getSubscriptionStatus(user.id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6">
          <BeakerIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {lang === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {lang === 'ar'
            ? 'اختر الخطة المناسبة لك للوصول إلى مجموعة شاملة من اختبارات الكشف عن المخدرات'
            : 'Choose the right plan for you to access our comprehensive drug detection testing suite'
          }
        </p>
      </div>

      {/* Current Subscription Status */}
      {user && subscriptionStatus && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {lang === 'ar' ? 'حالة الاشتراك الحالية' : 'Current Subscription Status'}
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                {subscriptionStatus.type === 'free' 
                  ? (lang === 'ar' ? 'الخطة المجانية' : 'Free Plan')
                  : (lang === 'ar' ? 'الخطة المميزة' : 'Premium Plan')
                }
                {subscriptionStatus.daysRemaining && (
                  <span className="ml-2 rtl:mr-2">
                    ({subscriptionStatus.daysRemaining} {lang === 'ar' ? 'يوم متبقي' : 'days remaining'})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = subscriptionStatus?.type === plan.id;
          const canUpgrade = plan.id === 'premium' && subscriptionStatus?.canUpgrade;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 ${
                plan.is_popular
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center space-x-1 rtl:space-x-reverse bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    <StarIcon className="h-4 w-4" />
                    <span>{lang === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</span>
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <div className="inline-flex items-center space-x-1 rtl:space-x-reverse bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <CheckIcon className="h-4 w-4" />
                    <span>{lang === 'ar' ? 'الخطة الحالية' : 'Current Plan'}</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {lang === 'ar' ? plan.name_ar : plan.name}
                </h3>
                <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 dark:text-gray-400">
                      /{lang === 'ar' ? 'شهر' : 'month'}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {(lang === 'ar' ? plan.features_ar : plan.features).map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                {plan.id === 'free' ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full"
                  >
                    {isCurrentPlan 
                      ? (lang === 'ar' ? 'الخطة الحالية' : 'Current Plan')
                      : (lang === 'ar' ? 'مجاني' : 'Free')
                    }
                  </Button>
                ) : (
                  <Button
                    onClick={handleUpgradeToPremium}
                    disabled={isLoading === 'premium' || isCurrentPlan}
                    className={`w-full flex items-center justify-center space-x-2 rtl:space-x-reverse ${
                      plan.is_popular 
                        ? 'bg-primary-600 hover:bg-primary-700' 
                        : ''
                    }`}
                  >
                    {isLoading === 'premium' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'الخطة الحالية' : 'Current Plan'}</span>
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'ترقية إلى المميز' : 'Upgrade to Premium'}</span>
                      </>
                    )}
                  </Button>
                )}

                {plan.id === 'premium' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {lang === 'ar'
                      ? 'يمكنك إلغاء الاشتراك في أي وقت'
                      : 'Cancel anytime'
                    }
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Trust */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gray-500 dark:text-gray-400 mb-4">
          <ShieldCheckIcon className="h-5 w-5" />
          <span className="text-sm">
            {lang === 'ar' 
              ? 'مدفوعات آمنة ومشفرة' 
              : 'Secure & encrypted payments'
            }
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {lang === 'ar'
            ? 'جميع المدفوعات محمية بتشفير SSL وتتم معالجتها بواسطة موفري دفع موثوقين. بياناتك آمنة معنا.'
            : 'All payments are protected with SSL encryption and processed by trusted payment providers. Your data is safe with us.'
          }
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
          {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
        
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {lang === 'ar' 
                ? 'ما الفرق بين الخطة المجانية والمميزة؟'
                : 'What\'s the difference between Free and Premium plans?'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? 'الخطة المجانية تتيح الوصول إلى 5 اختبارات أساسية، بينما الخطة المميزة تتيح الوصول إلى جميع الاختبارات المتاحة في قاعدة البيانات.'
                : 'The Free plan gives you access to 5 essential tests, while Premium unlocks all tests in our comprehensive database.'
              }
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {lang === 'ar' 
                ? 'هل يمكنني إلغاء اشتراكي في أي وقت؟'
                : 'Can I cancel my subscription anytime?'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? 'نعم، يمكنك إلغاء اشتراكك في أي وقت من صفحة إعدادات الحساب. ستحتفظ بالوصول حتى نهاية فترة الفوترة الحالية.'
                : 'Yes, you can cancel your subscription anytime from your account settings. You\'ll retain access until the end of your current billing period.'
              }
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {lang === 'ar' 
                ? 'هل البيانات آمنة؟'
                : 'Is my data secure?'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? 'نعم، نحن نستخدم أحدث معايير الأمان لحماية بياناتك. جميع المدفوعات مشفرة ولا نحتفظ بمعلومات بطاقات الائتمان.'
                : 'Yes, we use industry-standard security measures to protect your data. All payments are encrypted and we don\'t store credit card information.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
