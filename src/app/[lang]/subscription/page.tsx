import { Language } from '@/types';
import { SubscriptionPlans } from '@/components/subscription/subscription-plans';

interface SubscriptionPageProps {
  params: Promise<{ lang: Language }>;
}

export default async function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { lang } = await params;
  
  return <SubscriptionPlans lang={lang} />;
}
