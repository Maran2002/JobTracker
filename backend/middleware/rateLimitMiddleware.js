import rateLimit from 'express-rate-limit';

/* ─────────────────────────────────────────────────────────
   Shared response handler for rate-limit rejections
───────────────────────────────────────────────────────── */
const rateLimitHandler = (req, res) => {
    res.status(429).json({
        status: 'error',
        message: 'Too many requests. Please slow down and try again shortly.',
    });
};

/* ─────────────────────────────────────────────────────────
   GLOBAL limiter — applied to ALL /api routes
   100 requests per 15-minute window per IP
───────────────────────────────────────────────────────── */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,
    standardHeaders: true,      // Return RateLimit-* headers (RFC 6585)
    legacyHeaders: false,       // Disable X-RateLimit-* headers
    message: rateLimitHandler,
    handler: rateLimitHandler,
    skipSuccessfulRequests: false,
});

/* ─────────────────────────────────────────────────────────
   AUTH limiter — strict: 10 attempts per 15 minutes
   Applies to /api/auth/login and /api/auth/register
───────────────────────────────────────────────────────── */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitHandler,
    handler: rateLimitHandler,
    skipSuccessfulRequests: false,
});

/* ─────────────────────────────────────────────────────────
   OTP/2FA limiter — very strict: 5 attempts per 10 minutes
   Prevents brute-force on OTP endpoints
───────────────────────────────────────────────────────── */
export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitHandler,
    handler: rateLimitHandler,
    skipSuccessfulRequests: false,
});

/* ─────────────────────────────────────────────────────────
   WRITE limiter — moderate: 30 writes per 10 minutes
   Applies to POST/PUT/PATCH/DELETE on data routes
───────────────────────────────────────────────────────── */
export const writeLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitHandler,
    handler: rateLimitHandler,
    // Only count non-GET requests
    skip: (req) => req.method === 'GET',
});
