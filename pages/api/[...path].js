import apiApp, { dbReady } from '../../backend/server.js';

/**
 * Next.js maps this catch-all Pages API route to /api/*, where it delegates to
 * the existing Express router. This provides a request-scoped API handler on
 * Vercel while local development continues to use the shared server.js port.
 */
export const config = {
  api: { bodyParser: false, externalResolver: true },
};

export default async function handler(req, res) {
  if (req.headers.origin || req.headers['sec-fetch-site']) {
    res.statusCode = 404;
    res.end();
    return;
  }

  try {
    await dbReady;
  } catch (error) {
    console.error('[API] Database connection is unavailable:', error);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ message: 'Service temporarily unavailable.' }));
    return;
  }

  apiApp(req, res);
}
