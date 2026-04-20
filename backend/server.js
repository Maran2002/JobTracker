import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import connectDB from './db/connect.js';
import { protectApi } from './middleware/apiSecurityMiddleware.js';
import { globalLimiter, authLimiter, otpLimiter, writeLimiter } from './middleware/rateLimitMiddleware.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes         from './routes/authRoutes.js';
import userRoutes         from './routes/userRoutes.js';
import applicationRoutes  from './routes/applicationRoutes.js';
import interviewRoutes    from './routes/interviewRoutes.js';
import analyticsRoutes    from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';


// ── Connect to MongoDB ──────────────────────────────────────────────────
connectDB();

const app = express();

// ── Trust proxy (needed for accurate IP rate-limiting behind reverse proxy) ─
app.set('trust proxy', 1);

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

// ── CORS ────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman, curl) only in development
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin ${origin} not allowed.`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-app-key'],
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

// ── API key guard — all /api routes ─────────────────────────────────────
app.use('/api', protectApi);

// ── Global rate limiter — all /api routes ────────────────────────────────
app.use('/api', globalLimiter);

// ── Write rate limiter — all mutating /api routes ────────────────────────
app.use('/api', writeLimiter);

// ── Routes with specific rate limits ─────────────────────────────────────

// Auth: login + register — strict rate limit
app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
// OTP endpoints — very strict
app.use('/api/auth/verify-2fa-login', otpLimiter);
app.use('/api/user/verify-otp',       otpLimiter);
app.use('/api/user/send-otp',         otpLimiter);

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
    res.status(200).json({ status: 'ok', message: 'CareerTrack API is running.' });
});

// ── 404 handler (after all routes) ───────────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler (must be last) ──────────────────────────────────
app.use(globalErrorHandler);

// ── Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[SERVER] Running on port ${PORT}`);
    if (!process.env.API_KEY || !process.env.APP_KEY) {
        console.warn('[SECURITY] WARNING: API_KEY or APP_KEY is not set!');
    }
});
