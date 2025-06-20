/**
 * Test file for subscription access control system
 * اختبار نظام التحكم في الوصول للاشتراكات
 */

import { subscriptionService, FREE_TIER_TESTS } from '../subscription-service';

describe('Subscription Access Control System', () => {
  const mockUserId = 'test-user-123';
  const mockPremiumUserId = 'premium-user-456';

  beforeEach(() => {
    // Reset subscription service state
    subscriptionService['subscriptions'].clear();
  });

  describe('Free Tier Access', () => {
    test('should allow access to free tier tests', () => {
      // Initialize free subscription
      subscriptionService.initializeUserSubscription(mockUserId);

      FREE_TIER_TESTS.forEach(testId => {
        const hasAccess = subscriptionService.canAccessTest(mockUserId, testId);
        expect(hasAccess).toBe(true);
      });
    });

    test('should block access to premium tests for free users', () => {
      subscriptionService.initializeUserSubscription(mockUserId);

      const premiumTests = [
        'duquenois-levine-test',
        'cobalt-thiocyanate-test',
        'scott-test',
        'wagner-test',
        'simon-test',
        'ehrlich-test'
      ];

      premiumTests.forEach(testId => {
        const hasAccess = subscriptionService.canAccessTest(mockUserId, testId);
        expect(hasAccess).toBe(false);
      });
    });

    test('should return correct access info for free users', () => {
      subscriptionService.initializeUserSubscription(mockUserId);

      // Test free tier test
      const freeTestInfo = subscriptionService.getTestAccessInfo(mockUserId, 'marquis-test');
      expect(freeTestInfo).toEqual({
        hasAccess: true,
        isFree: true,
        isPremium: false,
        requiresUpgrade: false
      });

      // Test premium test
      const premiumTestInfo = subscriptionService.getTestAccessInfo(mockUserId, 'simon-test');
      expect(premiumTestInfo).toEqual({
        hasAccess: false,
        isFree: false,
        isPremium: true,
        requiresUpgrade: true
      });
    });
  });

  describe('Premium Access', () => {
    test('should allow access to all tests for premium users', async () => {
      // Create premium subscription
      const result = await subscriptionService.createPremiumSubscription(mockPremiumUserId, {
        amount: 10,
        currency: 'USD',
        payment_method: 'card'
      });

      expect(result.success).toBe(true);

      // Test access to free tier tests
      FREE_TIER_TESTS.forEach(testId => {
        const hasAccess = subscriptionService.canAccessTest(mockPremiumUserId, testId);
        expect(hasAccess).toBe(true);
      });

      // Test access to premium tests
      const premiumTests = ['simon-test', 'ehrlich-test', 'wagner-test'];
      premiumTests.forEach(testId => {
        const hasAccess = subscriptionService.canAccessTest(mockPremiumUserId, testId);
        expect(hasAccess).toBe(true);
      });
    });

    test('should return correct access info for premium users', async () => {
      await subscriptionService.createPremiumSubscription(mockPremiumUserId, {
        amount: 10,
        currency: 'USD',
        payment_method: 'card'
      });

      // Test premium test access
      const premiumTestInfo = subscriptionService.getTestAccessInfo(mockPremiumUserId, 'simon-test');
      expect(premiumTestInfo).toEqual({
        hasAccess: true,
        isFree: false,
        isPremium: true,
        requiresUpgrade: false
      });
    });
  });

  describe('Free Tier Tests Configuration', () => {
    test('should include exactly 5 free tier tests', () => {
      expect(FREE_TIER_TESTS).toHaveLength(5);
    });

    test('should include the correct free tier tests', () => {
      const expectedFreeTests = [
        'marquis-test',      // اختبار ماركيز - للكشف الأساسي
        'mecke-test',        // اختبار ميك - للمواد الأفيونية  
        'nitric-acid-test',  // اختبار حمض النيتريك
        'ferric-sulfate-test', // اختبار كبريتات الحديد
        'fast-blue-b-test'   // اختبار الحشيش
      ];

      expect(FREE_TIER_TESTS).toEqual(expectedFreeTests);
    });
  });

  describe('Subscription Status', () => {
    test('should return correct status for free users', () => {
      subscriptionService.initializeUserSubscription(mockUserId);
      
      const status = subscriptionService.getSubscriptionStatus(mockUserId);
      expect(status).toEqual({
        type: 'free',
        status: 'active',
        isActive: true,
        canUpgrade: true
      });
    });

    test('should return correct accessible tests count', () => {
      subscriptionService.initializeUserSubscription(mockUserId);
      
      const accessibleTests = subscriptionService.getAccessibleTests(mockUserId);
      expect(accessibleTests).toHaveLength(5);
      expect(accessibleTests).toEqual(FREE_TIER_TESTS);
    });
  });
});
