import Link from 'next/link';

export default function NotFound() {
  return <main className="not-found-page"><div className="not-found-code">404</div><h1>Page not found</h1><Link href="/dashboard">Back to Dashboard</Link></main>;
}
