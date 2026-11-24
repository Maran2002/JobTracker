import { timingSafeEqual } from 'node:crypto';

// Startup guard — warn early if security keys are not configured
if (!process.env.API_KEY || !process.env.APP_KEY) {
    console.warn('[SECURITY] WARNING: API_KEY or APP_KEY env vars are not set. All /api requests will be rejected.');
}

export const protectApi = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const appKey = req.headers['x-app-key'];

    // Fail-closed: if env vars are missing, reject immediately
    const validApiKey = process.env.API_KEY;
    const validAppKey = process.env.APP_KEY;

    if (!validApiKey || !validAppKey) {
        return res.status(503).json({ message: 'Service unavailable.' });
    }

    if (!apiKey || !appKey) {
        return res.status(403).json({ message: 'Forbidden: Missing security headers' });
    }

    const safeEqual = (received, expected) => {
        const receivedBytes = Buffer.from(received);
        const expectedBytes = Buffer.from(expected);
        return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
    };

    if (!safeEqual(apiKey, validApiKey) || !safeEqual(appKey, validAppKey)) {
        return res.status(403).json({ message: 'Forbidden: Invalid security headers' });
    }

    res.set('Cache-Control', 'no-store');
    next();
};
