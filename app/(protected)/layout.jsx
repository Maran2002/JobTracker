import { redirect } from 'next/navigation';
import MainLayout from '../../src/layouts/MainLayout';
import { getPrivateData } from '../lib/data';

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }) {
  const profile = await getPrivateData('/user/me');
  if (!profile) redirect('/login');
  return <MainLayout initialUser={profile}>{children}</MainLayout>;
}
