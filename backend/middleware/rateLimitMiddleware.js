import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const readClientIp = (req) => {
    const forwardedIp = req.get('x-rate-limit-client-ip');
    return forwardedIp || req.ip || req.socket.remoteAddress || 'unknown';
};

const verifiedUserId = (req) => {
    const authorization = req.get('authorization') || '';
    if (!authorization.startsWith('Bearer ') || !process.env.JWT_SECRET) return null;
    try {
        const payload = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
        return typeof payload === 'object' && payload?.id ? String(payload.id) : null;
    } catch {
        return null;
    }
};

const identityKey = (req) => {
    const userId = verifiedUserId(req);
    return userId ? `user:${userId}` : `ip:${ipKeyGenerator(readClientIp(req))}`;
};

const accountKey = (req) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return identityKey(req);
    const digest = createHash('sha256').update(email).digest('hex');
    return `account:${digest}`;
};

const rateLimitHandler = (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(429).json({
        status: 'error',
        message: 'Too many requests. Please slow down and try again shortly.',
    });
};

const createLimiter = ({ windowMs, max, keyGenerator = identityKey }) => rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator,
    handler: rateLimitHandler,
    passOnStoreError: false,
});

// Counts signed-in traffic per verified user; unauthenticated traffic uses socket IP.
export const globalLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 240 });

// Separate IP and account buckets prevent one noisy account from exhausting all auth capacity.
export const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 20, keyGenerator: (req) => `auth-ip:${ipKeyGenerator(readClientIp(req))}` });
export const authAccountLimiter = createLimiter({ windowMs: 30 * 60 * 1000, max: 6, keyGenerator: accountKey });

// OTP and password-reset operations are additionally limited per account.
export const otpLimiter = createLimiter({ windowMs: 10 * 60 * 1000, max: 5, keyGenerator: accountKey });
export const otpIpLimiter = createLimiter({ windowMs: 10 * 60 * 1000, max: 20, keyGenerator: (req) => `otp-ip:${ipKeyGenerator(readClientIp(req))}` });

// Mutation volume is limited separately from reads.
export const writeLimiter = createLimiter({ windowMs: 10 * 60 * 1000, max: 60 });
