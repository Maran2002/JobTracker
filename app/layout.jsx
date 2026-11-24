import '../src/index.css';
import AppProviders from '../src/components/AppProviders';

export const metadata = {
  title: 'ApplyLog | CareerTrack',
  description: 'A private workspace to organize your job search and track every application.',
  icons: { icon: '/favicon.svg' },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return <html lang="en"><body><AppProviders>{children}</AppProviders></body></html>;
}
