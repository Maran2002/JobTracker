'use server';

import { cookies, headers as getRequestHeaders } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiBaseUrl, getRequestOrigin } from '../lib/apiBase.js';

/** Server-only bridge to the private Express service. Never expose backend keys to the browser. */
export async function requestApi(method, path, payload) {
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method) || !/^\/[a-zA-Z0-9/?=&._%-]+$/.test(path)) {
    return { status: 400, data: { message: 'Invalid request.' } };
  }
  const jar = await cookies();
  const requestHeaders = await getRequestHeaders();
  const apiBaseUrl = getApiBaseUrl(requestHeaders);
  const requestOrigin = getRequestOrigin(requestHeaders);
  const token = jar.get('careertrack_session')?.value;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(process.env.API_KEY ? { 'x-api-key': process.env.API_KEY } : {}),
    ...(process.env.APP_KEY ? { 'x-app-key': process.env.APP_KEY } : {}),
    ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {}),
    ...(requestOrigin && new URL(apiBaseUrl).origin === requestOrigin && requestHeaders.get('cookie')
      ? { Cookie: requestHeaders.get('cookie') }
      : {}),
    ...(requestHeaders.get('x-client-ip') ? { 'x-rate-limit-client-ip': requestHeaders.get('x-client-ip') } : {}),
  };
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);

  if ((path === '/auth/login' || path === '/auth/verify-register') && response.ok && data?.token) {
    jar.set('careertrack_session', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    delete data.token;
  }
  if (method === 'POST' && path === '/auth/logout') jar.delete('careertrack_session');
  return { status: response.status, data };
}

export async function clearSession() {
  (await cookies()).delete('careertrack_session');
  redirect('/login');
}
