import 'server-only';
import { cookies, headers } from 'next/headers';

const API_BASE = process.env.INTERNAL_API_URL || `http://127.0.0.1:${process.env.PORT || 3000}/api`;

export async function getPrivateData(path) {
  const token = (await cookies()).get('careertrack_session')?.value;
  const requestHeaders = await headers();
  if (!token) return null;
  const response = await fetch(`${API_BASE}${path}`, {
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
