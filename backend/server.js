import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import connectDB from './db/connect.js';
import { protectApi } from './middleware/apiSecurityMiddleware.js';
import { globalLimiter, authLimiter, authAccountLimiter, otpLimiter, otpIpLimiter, writeLimiter } from './middleware/rateLimitMiddleware.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes         from './routes/authRoutes.js';
import userRoutes         from './routes/userRoutes.js';
import applicationRoutes  from './routes/applicationRoutes.js';
import interviewRoutes    from './routes/interviewRoutes.js';
import analyticsRoutes    from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';


// ── Connect to MongoDB ──────────────────────────────────────────────────
export const dbReady = connectDB();

const app = express();

// The shared Next listener forwards a socket-derived client IP to the private API.
// Express ignores forwarded headers to avoid spoofed client IPs.
app.set('trust proxy', false);

// ── Security headers (helmet) ───────────────────────────────────────────
app.use(helmet({
    // Allow same-origin iframe for dev; tighten in production as needed
    frameguard:        { action: 'sameorigin' },
    // Keep referrer short
    referrerPolicy:    { policy: 'strict-origin-when-cross-origin' },
    // Disable MIME sniffing
    noSniff:           true,
    // Force HTTPS (only meaningful behind TLS)
    hsts:              { maxAge: 31536000, includeSubDomains: true },
    // Hide X-Powered-By
    hidePoweredBy:     true,
    // XSS filter
    xssFilter:         true,
}));

// ── Body parsing — limit payload size to prevent large-payload DoS ──────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── NoSQL injection sanitization ────────────────────────────────────────
// Strips $ and . from user-supplied values (prevents Mongo operator injection)
// Note: In Express 5, req.query is a read-only getter, so we sanitize manually
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    if (req.headers) req.headers = mongoSanitize.sanitize(req.headers, { replaceWith: '_' });
    next();
});

// ── HTTP Parameter Pollution prevention ─────────────────────────────────
app.use(hpp());

// ── Response compression ────────────────────────────────────────────────
// Compresses responses > 1 KB — faster transfers, lower bandwidth
app.use(compression({
    level: 6,              // balanced speed/compression ratio
    threshold: 1024,       // only compress responses > 1 KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    },
}));

// ── Global rate limiter — all /api routes ────────────────────────────────
app.use('/api', globalLimiter);

// ── API key guard — all /api routes ─────────────────────────────────────
app.use('/api', protectApi);

// ── Write rate limiter — all mutating /api routes ────────────────────────
app.use('/api', writeLimiter);

// ── Routes with specific rate limits ─────────────────────────────────────

// Auth: login + register — strict rate limit
app.use('/api/auth/login',           authLimiter, authAccountLimiter);
app.use('/api/auth/register',        authLimiter, authAccountLimiter);
// OTP endpoints — very strict
app.use('/api/auth/verify-2fa-login', otpIpLimiter, otpLimiter);
app.use('/api/auth/verify-register',  otpIpLimiter, otpLimiter);
app.use('/api/auth/forgot-password',  otpIpLimiter, otpLimiter);
app.use('/api/auth/reset-password',   otpIpLimiter, otpLimiter);
app.use('/api/user/verify-otp',       otpIpLimiter, otpLimiter);
app.use('/api/user/send-otp',         otpIpLimiter, otpLimiter);
app.use('/api/user/change-password',  otpIpLimiter, otpLimiter);
app.use('/api/user/toggle-2fa',       otpIpLimiter, otpLimiter);
app.use('/api/user/delete-account',   otpIpLimiter, otpLimiter);

// Mount routes
app.use('/api/auth',          authRoutes);
app.use('/api/user',          userRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/interviews',    interviewRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);

// ── Health check (public, no auth) ───────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ApplyLog API is running.' });
});

// ── 404 handler (after all routes) ───────────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler (must be last) ──────────────────────────────────
app.use(globalErrorHandler);

// In Next.js mode, the app is mounted into the same HTTP server as the SSR site.
// Keep this file independently runnable for local API maintenance only.
if (process.env.STANDALONE_API === 'true') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`[SERVER] API running on port ${PORT}`));
}

export default app;
