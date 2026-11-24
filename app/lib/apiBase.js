import 'server-only';

/**
 * Resolve the private API origin for server-side calls.
 * Local development uses the shared Next/Express listener. Vercel deploys the
 * Express API as a function on the current deployment URL.
 */
export function getRequestOrigin(requestHeaders) {
  const forwardedHost = requestHeaders?.get('x-forwarded-host') || requestHeaders?.get('host');
  if (!forwardedHost) return null;

  const host = forwardedHost.split(',')[0].trim();
  const forwardedProtocol = requestHeaders?.get('x-forwarded-proto');
  const protocol = (forwardedProtocol?.split(',')[0].trim() || (process.env.VERCEL ? 'https' : 'http')).replace(/:$/, '');

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return null;
  }
}

export function getApiBaseUrl(requestHeaders) {
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/+$/, '');
  }

  const requestOrigin = getRequestOrigin(requestHeaders);
  if (requestOrigin) {
    return `${requestOrigin}/api`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/api`;
  }

  return `http://127.0.0.1:${process.env.PORT || 3000}/api`;
}
