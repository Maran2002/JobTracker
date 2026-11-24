import 'server-only';

/**
 * Resolve the private API origin for server-side calls.
 * Local development uses the shared Next/Express listener. Vercel deploys the
 * Express API as a function on the current deployment URL.
 */
export function getApiBaseUrl() {
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/+$/, '');
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/api`;
  }

  return `http://127.0.0.1:${process.env.PORT || 3000}/api`;
}
