'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Language } from '@/types';
import { getTranslationsSync } from '@/lib/translations';
import { useAuth } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import {
  BeakerIcon,
  LanguageIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface HomePageProps {
  lang: Language;
}

export function HomePage({ lang }: HomePageProps) {
  const t = getTranslationsSync(lang);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push(`/${lang}/tests`);
    } else {
      router.push(`/${lang}/auth`);
    }
  };

  const features = [
    {
      icon: BeakerIcon,
      title: t('home.features.comprehensive_tests'),
      description: t('home.features.comprehensive_tests_desc'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: GlobeAltIcon,
      title: t('home.features.bilingual_support'),
      description: t('home.features.bilingual_support_desc'),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      icon: ShieldCheckIcon,
      title: t('home.features.safety_first'),
      description: t('home.features.safety_first_desc'),
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      icon: DocumentTextIcon,
      title: t('home.features.professional_reports'),
      description: t('home.features.professional_reports_desc'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  const stats = [
    { number: '12', label: lang === 'ar' ? 'نوع اختبار' : 'Test Types' },
    { number: '46', label: lang === 'ar' ? 'نتيجة لونية' : 'Color Results' },
    { number: '2', label: lang === 'ar' ? 'لغة مدعومة' : 'Languages' },
    { number: '100%', label: lang === 'ar' ? 'دقة علمية' : 'Scientific Accuracy' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-background dark:to-secondary-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium mb-8">
              <SparklesIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'الإصدار 2.0.0 - محدث ومطور' : 'Version 2.0.0 - Updated & Enhanced'}
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              <span className="text-gradient">{t('home.title')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('home.subtitle')}
            </p>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              {t('home.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="xl"
                onClick={handleGetStarted}
                className="bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <span className="flex items-center">
                  <BeakerIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {isAuthenticated
                    ? t('home.get_started')
                    : (lang === 'ar' ? 'ابدأ الآن - سجل مجاناً' : 'Get Started - Sign Up Free')
                  }
                  <ArrowRightIcon className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              </Button>

              {!isAuthenticated && (
                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => router.push(`/${lang}/auth`)}
                  className="border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950"
                >
                  {lang === 'ar' ? 'لديك حساب؟ سجل دخول' : 'Have an account? Sign In'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {lang === 'ar' 
                ? 'اكتشف الميزات المتقدمة التي تجعل نظامنا الخيار الأمثل للاختبارات الكيميائية'
                : 'Discover the advanced features that make our system the optimal choice for chemical testing'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl border border-gray-300 bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 dark:border-gray-600 dark:bg-gray-800"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {isAuthenticated
                ? (lang === 'ar' ? 'ابدأ الاختبار الآن' : 'Start Testing Now')
                : (lang === 'ar' ? 'انضم إلينا اليوم' : 'Join Us Today')
              }
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              {isAuthenticated
                ? (lang === 'ar'
                  ? 'استخدم مجموعة شاملة من الاختبارات الكيميائية للكشف عن المواد المخدرة'
                  : 'Use our comprehensive suite of chemical tests for drug detection'
                )
                : (lang === 'ar'
                  ? 'ابدأ مع الخطة المجانية واحصل على 5 اختبارات أساسية، أو ترقى للحصول على الوصول الكامل'
                  : 'Start with our free plan and get 5 essential tests, or upgrade for full access'
                )
              }
            </p>
            <Button
              size="xl"
              onClick={handleGetStarted}
              className="bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <span className="flex items-center">
                <BeakerIcon className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {isAuthenticated
                  ? t('home.get_started')
                  : (lang === 'ar' ? 'ابدأ مجاناً' : 'Start Free')
                }
                <ArrowRightIcon className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
