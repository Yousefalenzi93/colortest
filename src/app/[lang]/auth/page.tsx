import { Language } from '@/types';
import { AuthPage } from '@/components/auth/auth-page';

interface AuthPageProps {
  params: Promise<{ lang: Language }>;
}

export default async function Auth({ params }: AuthPageProps) {
  const { lang } = await params;
  
  return <AuthPage lang={lang} />;
}
