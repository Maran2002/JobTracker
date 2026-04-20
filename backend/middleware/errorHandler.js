/* ─────────────────────────────────────────────────────────
   GLOBAL ERROR HANDLER
   Catches any error thrown / passed via next(err) in routes
───────────────────────────────────────────────────────── */

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
    // Log the stack in development only
    if (process.env.NODE_ENV !== 'production') {
        console.error('[ERROR]', err.stack || err.message);
    } else {
        console.error('[ERROR]', err.message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: Object.values(err.errors).map((e) => e.message).join(', '),
        });
    }

    // Mongoose duplicate key (e.g. unique email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({
            status: 'error',
            message: `Duplicate value for ${field}. Please use a different value.`,
        });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            message: `Invalid value for field: ${err.path}`,
        });
    }

    // JWT errors (already handled per-route but catch any leakage)
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ status: 'error', message: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'error', message: 'Token expired. Please log in again.' });
    }

    // Body too large
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ status: 'error', message: 'Request body too large.' });
    }

    // Default: internal server error (never leak stack to client)
    const status = err.statusCode || err.status || 500;
    const message = status < 500 ? err.message : 'An internal server error occurred.';

    return res.status(status).json({ status: 'error', message });
};

/* ─────────────────────────────────────────────────────────
   404 HANDLER — must be registered AFTER all routes
───────────────────────────────────────────────────────── */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
};
