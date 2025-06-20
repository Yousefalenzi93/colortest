import { Language } from '@/types';
import { AdminPage } from '@/components/pages/admin-page';

interface AdminPageProps {
  params: Promise<{ lang: Language }>;
}

export default async function Admin({ params }: AdminPageProps) {
  const { lang } = await params;
  return <AdminPage lang={lang} />;
}
