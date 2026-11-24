import 'server-only';
import { cookies, headers } from 'next/headers';
import { getApiBaseUrl } from './apiBase.js';

export async function getPrivateData(path) {
  const token = (await cookies()).get('careertrack_session')?.value;
  const requestHeaders = await headers();
  if (!token) return null;
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(process.env.API_KEY ? { 'x-api-key': process.env.API_KEY } : {}),
      ...(process.env.APP_KEY ? { 'x-app-key': process.env.APP_KEY } : {}),
      ...(requestHeaders.get('x-client-ip') ? { 'x-rate-limit-client-ip': requestHeaders.get('x-client-ip') } : {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}
