/**
 * Subscription Service
 * Handles subscription management, payments, and access control
 */

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

// Types
export interface Subscription {
  id: string;
  user_id: string;
  subscription_type: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  amount_paid?: number;
  currency: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  payment_method?: string;
  description?: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  features_ar: string[];
  is_popular?: boolean;
}

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    name_ar: 'الخطة المجانية',
    price: 0,
    currency: 'USD',
    duration_days: 0, // Unlimited
    features: [
      'Access to 5 basic chemical tests',
      'Marquis Test for basic drug detection',
      'Mecke Test for opioids',
      'Nitric Acid Test for differentiation',
      'Ferric Sulfate Test for opium',
      'Fast Blue B Salt Test for cannabis'
    ],
    features_ar: [
      'الوصول إلى 5 اختبارات كيميائية أساسية',
      'اختبار ماركيز للكشف الأساسي عن المخدرات',
      'اختبار ميك للمواد الأفيونية',
      'اختبار حمض النيتريك للتمييز',
      'اختبار كبريتات الحديد للأفيون',
      'اختبار ملح الأزرق السريع للحشيش'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    name_ar: 'الخطة المميزة',
    price: 10,
    currency: 'USD',
    duration_days: 30,
    features: [
      'Access to ALL chemical tests',
      'Advanced drug detection methods',
      'Specialized tests for synthetic drugs',
      'Comprehensive test database',
      'Priority customer support',
      'Regular database updates',
      'Export test results',
      'Advanced search and filtering'
    ],
    features_ar: [
      'الوصول إلى جميع الاختبارات الكيميائية',
      'طرق الكشف المتقدمة عن المخدرات',
      'اختبارات متخصصة للمخدرات الاصطناعية',
      'قاعدة بيانات شاملة للاختبارات',
      'دعم عملاء ذو أولوية',
      'تحديثات منتظمة لقاعدة البيانات',
      'تصدير نتائج الاختبارات',
      'بحث وتصفية متقدمة'
    ],
    is_popular: true
  }
];

// Free tier test IDs - الاختبارات المجانية
export const FREE_TIER_TESTS = [
  'marquis-test',      // اختبار ماركيز - للكشف الأساسي
  'mecke-test',        // اختبار ميك - للمواد الأفيونية
  'nitric-acid-test',  // اختبار حمض النيتريك
  'ferric-sulfate-test', // اختبار كبريتات الحديد
  'fast-blue-b-test'   // اختبار الحشيش
];

class SubscriptionService {
  private subscriptions: Map<string, Subscription> = new Map();
  private paymentHistory: Map<string, PaymentHistory[]> = new Map();

  /**
   * Get subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Get user subscription
   */
  getUserSubscription(userId: string): Subscription | null {
    return this.subscriptions.get(userId) || null;
  }

  /**
   * Check if user has premium access
   */
  hasPremiumAccess(userId: string): boolean {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) return false;

    if (subscription.subscription_type === 'free') return false;

    if (subscription.status !== 'active') return false;

    // Check if subscription is expired
    if (subscription.end_date && new Date(subscription.end_date) <= new Date()) {
      // Auto-expire subscription
      subscription.status = 'expired';
      this.subscriptions.set(userId, subscription);
      return false;
    }

    return true;
  }

  /**
   * Check if user can access a specific test
   */
  canAccessTest(userId: string, testId: string): boolean {
    // Check if it's a free tier test
    if (FREE_TIER_TESTS.includes(testId)) {
      return true;
    }

    // Check premium access for other tests
    return this.hasPremiumAccess(userId);
  }

  /**
   * Get test access info for UI display
   */
  getTestAccessInfo(userId: string, testId: string): {
    hasAccess: boolean;
    isFree: boolean;
    isPremium: boolean;
    requiresUpgrade: boolean;
  } {
    const isFree = FREE_TIER_TESTS.includes(testId);
    const hasAccess = this.canAccessTest(userId, testId);
    const hasPremium = this.hasPremiumAccess(userId);

    return {
      hasAccess,
      isFree,
      isPremium: !isFree,
      requiresUpgrade: !hasAccess && !hasPremium
    };
  }

  /**
   * Get accessible tests for user
   */
  getAccessibleTests(userId: string): string[] {
    if (this.hasPremiumAccess(userId)) {
      // Return all test IDs - جميع الاختبارات للمستخدمين المميزين
      return [
        ...FREE_TIER_TESTS,
        'duquenois-levine-test',
        'cobalt-thiocyanate-test',
        'scott-test',
        'wagner-test',
        'simon-test',
        'ehrlich-test',
        'liebermann-test',
        'potassium-dichromate-test',
        'chen-kao-test',
        'modified-cobalt-thiocyanate-test',
        'nitric-sulfuric-acid-test',
        '1-2-dinitrobenzene-test',
        '1-3-dinitrobenzene-test',
        '1-4-dinitrobenzene-test'
      ];
    }

    return FREE_TIER_TESTS;
  }

  /**
   * Create premium subscription
   */
  async createPremiumSubscription(
    userId: string,
    paymentData: {
      amount: number;
      currency: string;
      payment_method: string;
      stripe_subscription_id?: string;
      stripe_customer_id?: string;
    }
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    try {
      const subscriptionId = generateUUID();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days

      const subscription: Subscription = {
        id: subscriptionId,
        user_id: userId,
        subscription_type: 'premium',
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        stripe_subscription_id: paymentData.stripe_subscription_id,
        stripe_customer_id: paymentData.stripe_customer_id,
        amount_paid: paymentData.amount,
        currency: paymentData.currency,
        auto_renew: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.subscriptions.set(userId, subscription);

      // Record payment
      const payment: PaymentHistory = {
        id: generateUUID(),
        user_id: userId,
        subscription_id: subscriptionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'succeeded',
        payment_method: paymentData.payment_method,
        description: 'Premium subscription - 30 days',
        created_at: new Date().toISOString()
      };

      const userPayments = this.paymentHistory.get(userId) || [];
      userPayments.push(payment);
      this.paymentHistory.set(userId, userPayments);

      return {
        success: true,
        subscription
      };

    } catch (error) {
      console.error('Error creating premium subscription:', error);
      return {
        success: false,
        error: 'Failed to create subscription'
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        return {
          success: false,
          error: 'No subscription found'
        };
      }

      subscription.status = 'cancelled';
      subscription.auto_renew = false;
      subscription.updated_at = new Date().toISOString();

      this.subscriptions.set(userId, subscription);

      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: 'Failed to cancel subscription'
      };
    }
  }

  /**
   * Get user payment history
   */
  getPaymentHistory(userId: string): PaymentHistory[] {
    return this.paymentHistory.get(userId) || [];
  }

  /**
   * Get subscription status info
   */
  getSubscriptionStatus(userId: string): {
    type: 'free' | 'premium';
    status: string;
    daysRemaining?: number;
    isActive: boolean;
    canUpgrade: boolean;
  } {
    const subscription = this.subscriptions.get(userId);
    
    if (!subscription || subscription.subscription_type === 'free') {
      return {
        type: 'free',
        status: 'active',
        isActive: true,
        canUpgrade: true
      };
    }

    const isActive = subscription.status === 'active' && 
                    (!subscription.end_date || new Date(subscription.end_date) > new Date());

    let daysRemaining: number | undefined;
    if (subscription.end_date) {
      const endDate = new Date(subscription.end_date);
      const now = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      type: subscription.subscription_type,
      status: subscription.status,
      daysRemaining,
      isActive,
      canUpgrade: !isActive
    };
  }

  /**
   * Initialize default subscription for user
   */
  initializeUserSubscription(userId: string): Subscription {
    const subscription: Subscription = {
      id: generateUUID(),
      user_id: userId,
      subscription_type: 'free',
      status: 'active',
      start_date: new Date().toISOString(),
      currency: 'USD',
      auto_renew: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.subscriptions.set(userId, subscription);
    return subscription;
  }

  /**
   * Simulate payment processing (replace with actual Stripe integration)
   */
  async processPayment(
    userId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<{ success: boolean; payment_intent_id?: string; error?: string }> {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        const paymentIntentId = `pi_${generateUUID().replace(/-/g, '')}`;
        return {
          success: true,
          payment_intent_id: paymentIntentId
        };
      } else {
        return {
          success: false,
          error: 'Payment failed. Please try again.'
        };
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
