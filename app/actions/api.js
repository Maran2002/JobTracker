'use server';

import { cookies, headers as getRequestHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE = process.env.INTERNAL_API_URL || `http://127.0.0.1:${process.env.PORT || 3000}/api`;

/** Server-only bridge to the private Express service. Never expose backend keys to the browser. */
export async function requestApi(method, path, payload) {
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method) || !/^\/[a-zA-Z0-9/?=&._%-]+$/.test(path)) {
    return { status: 400, data: { message: 'Invalid request.' } };
  }
  const jar = await cookies();
  const requestHeaders = await getRequestHeaders();
  const token = jar.get('careertrack_session')?.value;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(process.env.API_KEY ? { 'x-api-key': process.env.API_KEY } : {}),
    ...(process.env.APP_KEY ? { 'x-app-key': process.env.APP_KEY } : {}),
    ...(requestHeaders.get('x-client-ip') ? { 'x-rate-limit-client-ip': requestHeaders.get('x-client-ip') } : {}),
  };
  const response = await fetch(`${API_BASE}${path}`, {
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
