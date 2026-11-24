import { config as loadEnv } from 'dotenv';
import { createServer } from 'node:http';
import next from 'next';

loadEnv();
const missingSecrets = ['MONGO_URI', 'JWT_SECRET', 'API_KEY', 'APP_KEY'].filter((name) => !process.env[name]);
if (missingSecrets.length) {
  throw new Error(`Missing required root .env settings: ${missingSecrets.join(', ')}`);
}
const { default: apiApp, dbReady } = await import('./backend/server.js');
await dbReady;

const dev = process.argv.includes('--dev');
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname: '0.0.0.0', port });
const handle = app.getRequestHandler();

function resolveClientIp(req) {
  const trustedHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10);
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',').map((ip) => ip.trim()).filter(Boolean);
  if (trustedHops > 0 && Number.isInteger(trustedHops) && forwarded.length >= trustedHops) {
    return forwarded[Math.max(0, forwarded.length - trustedHops)];
  }
  return req.socket.remoteAddress || 'unknown';
}

await app.prepare();
createServer((req, res) => {
  // Set from the socket or a deliberately configured proxy chain, never trust a client-supplied copy.
  req.headers['x-client-ip'] = resolveClientIp(req);
  if (req.url?.startsWith('/api/')) {
    // API routes are an internal server boundary. Browser-origin requests are rejected.
    if (req.headers.origin || req.headers['sec-fetch-site']) {
      res.writeHead(404);
      res.end();
      return;
    }
    apiApp(req, res);
    return;
  }
  handle(req, res);
}).listen(port, '0.0.0.0', () => {
  console.log(`[CareerTrack] Next.js SSR and private API listening on port ${port}`);
});
