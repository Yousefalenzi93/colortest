'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { DataService, ChemicalTest } from '@/lib/data-service';
import { subscriptionService } from '@/lib/subscription-service';
import { useAuth } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { TestCard } from '@/components/ui/test-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  BeakerIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon,
  StarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface TestsPageProps {
  lang: Language;
}

export function TestsPage({ lang }: TestsPageProps) {
  const [tests, setTests] = useState<ChemicalTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<ChemicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSafetyLevel, setSelectedSafetyLevel] = useState<string>('all');

  const router = useRouter();
  const t = getTranslationsSync(lang);
  const { user } = useAuth();

  // Get user subscription status and accessible tests
  const subscriptionStatus = user ? subscriptionService.getSubscriptionStatus(user.id) : null;
  const accessibleTestIds = user ? subscriptionService.getAccessibleTests(user.id) : [];

  useEffect(() => {
    // Load tests from data service
    const loadTests = async () => {
      try {
        const chemicalTests = DataService.getChemicalTests();
        setTests(chemicalTests);
        setFilteredTests(chemicalTests);
      } catch (error) {
        console.error('Error loading tests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    // Filter tests based on search and filters
    let filtered = tests;

    // Search filter
    if (searchQuery) {
      filtered = DataService.searchTests(searchQuery, lang);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }

    // Safety level filter
    if (selectedSafetyLevel !== 'all') {
      filtered = filtered.filter(test => test.safety_level === selectedSafetyLevel);
    }

    setFilteredTests(filtered);
  }, [tests, searchQuery, selectedCategory, selectedSafetyLevel, lang]);

  const categories = [
    { value: 'all', label: lang === 'ar' ? 'جميع الفئات' : 'All Categories' },
    { value: 'basic', label: t('tests.categories.basic') },
    { value: 'advanced', label: t('tests.categories.advanced') },
    { value: 'specialized', label: t('tests.categories.specialized') },
  ];

  const safetyLevels = [
    { value: 'all', label: lang === 'ar' ? 'جميع المستويات' : 'All Levels' },
    { value: 'low', label: t('tests.safety_levels.low') },
    { value: 'medium', label: t('tests.safety_levels.medium') },
    { value: 'high', label: t('tests.safety_levels.high') },
    { value: 'extreme', label: t('tests.safety_levels.extreme') },
  ];

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
      case 'extreme': return 'text-red-600 bg-red-50 dark:bg-red-950';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6">
            <BeakerIcon className="h-8 w-8 text-primary-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('tests.title')}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('tests.subtitle')}
          </p>

          {/* Subscription Status Banner */}
          {user && subscriptionStatus && (
            <div className={`max-w-4xl mx-auto mb-8 p-6 rounded-lg border ${
              subscriptionStatus.type === 'premium'
                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  {subscriptionStatus.type === 'premium' ? (
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <BeakerIcon className="h-6 w-6 text-blue-600" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      subscriptionStatus.type === 'premium'
                        ? 'text-yellow-900 dark:text-yellow-100'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {subscriptionStatus.type === 'premium'
                        ? (lang === 'ar' ? 'الخطة المميزة نشطة' : 'Premium Plan Active')
                        : (lang === 'ar' ? 'الخطة المجانية' : 'Free Plan')
                      }
                    </h3>
                    <p className={`text-sm ${
                      subscriptionStatus.type === 'premium'
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {subscriptionStatus.type === 'premium'
                        ? (lang === 'ar'
                          ? `الوصول إلى جميع الاختبارات${subscriptionStatus.daysRemaining ? ` - ${subscriptionStatus.daysRemaining} يوم متبقي` : ''}`
                          : `Access to all tests${subscriptionStatus.daysRemaining ? ` - ${subscriptionStatus.daysRemaining} days remaining` : ''}`
                        )
                        : (lang === 'ar'
                          ? `الوصول إلى ${accessibleTestIds.length} اختبارات مجانية`
                          : `Access to ${accessibleTestIds.length} free tests`
                        )
                      }
                    </p>
                  </div>
                </div>

                {subscriptionStatus.canUpgrade && (
                  <Button
                    onClick={() => router.push(`/${lang}/subscription`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {lang === 'ar' ? 'ترقية إلى المميز' : 'Upgrade to Premium'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-primary-600">{tests.length}</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'اختبار متاح' : 'Available Tests'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-secondary-600">46</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'نتيجة لونية' : 'Color Results'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-success-600">2</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'لغة مدعومة' : 'Languages'}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
              <div className="text-2xl font-bold text-warning-600">100%</div>
              <div className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'دقة علمية' : 'Accuracy'}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={lang === 'ar' ? 'البحث في الاختبارات...' : 'Search tests...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FunnelIcon className="h-5 w-5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ExclamationTriangleIcon className="h-5 w-5 text-muted-foreground" />
              <select
                value={selectedSafetyLevel}
                onChange={(e) => setSelectedSafetyLevel(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {safetyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <BeakerIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {lang === 'ar' ? 'لا توجد اختبارات' : 'No tests found'}
            </h3>
            <p className="text-muted-foreground">
              {lang === 'ar' 
                ? 'جرب تغيير معايير البحث أو الفلترة'
                : 'Try changing your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTests.map((test) => {
              const accessInfo = user ? subscriptionService.getTestAccessInfo(user.id, test.id) :
                { hasAccess: true, isFree: true, isPremium: false, requiresUpgrade: false };

              return (
                <div key={test.id} className="relative">
                  <TestCard
                    test={test}
                    lang={lang}
                    onClick={(testId) => {
                      if (accessInfo.hasAccess || !user) {
                        console.log('Test card clicked, navigating to:', `/${lang}/tests/${testId}`);
                        router.push(`/${lang}/tests/${testId}`);
                      } else {
                        // Show upgrade prompt for locked tests
                        router.push(`/${lang}/subscription`);
                      }
                    }}
                    className={accessInfo.requiresUpgrade ? 'opacity-75' : ''}
                  />

                  {/* Free Badge for Free Tests */}
                  {accessInfo.isFree && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {lang === 'ar' ? 'مجاني' : 'Free'}
                    </div>
                  )}

                  {/* Premium Badge for Premium Tests with Access */}
                  {accessInfo.isPremium && accessInfo.hasAccess && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <StarIcon className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                      {lang === 'ar' ? 'مميز' : 'Premium'}
                    </div>
                  )}

                  {/* Lock Overlay for Premium Tests without Access */}
                  {accessInfo.requiresUpgrade && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <LockClosedIcon className="h-8 w-8 text-white mx-auto mb-2" />
                        <p className="text-white font-medium text-sm mb-2">
                          {lang === 'ar' ? 'اختبار مميز' : 'Premium Test'}
                        </p>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/${lang}/subscription`);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                        >
                          <StarIcon className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                          {lang === 'ar' ? 'ترقية' : 'Upgrade'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
}
