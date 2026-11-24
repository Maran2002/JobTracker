import 'server-only';
import { cookies, headers } from 'next/headers';
import { getApiBaseUrl, getRequestOrigin } from './apiBase.js';

export async function getPrivateData(path) {
  const token = (await cookies()).get('careertrack_session')?.value;
  const requestHeaders = await headers();
  if (!token) return null;
  const apiBaseUrl = getApiBaseUrl(requestHeaders);
  const requestOrigin = getRequestOrigin(requestHeaders);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(process.env.API_KEY ? { 'x-api-key': process.env.API_KEY } : {}),
      ...(process.env.APP_KEY ? { 'x-app-key': process.env.APP_KEY } : {}),
      ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {}),
      ...(requestOrigin && new URL(apiBaseUrl).origin === requestOrigin && requestHeaders.get('cookie')
        ? { Cookie: requestHeaders.get('cookie') }
        : {}),
      ...(requestHeaders.get('x-client-ip') ? { 'x-rate-limit-client-ip': requestHeaders.get('x-client-ip') } : {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}
