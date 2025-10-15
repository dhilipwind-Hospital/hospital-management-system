"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordLimiter = exports.registerLimiter = exports.loginLimiter = exports.rateLimit = void 0;
// Simple in-memory fixed-window rate limiter
function rateLimit(options) {
    const { windowMs, max, keyGenerator, message } = options;
    const store = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const key = (keyGenerator ? keyGenerator(req) : req.ip) || req.ip || 'unknown';
        const entry = store.get(key);
        if (!entry || now > entry.resetAt) {
            store.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        entry.count += 1;
        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
            return res.status(429).json({ message: message || 'Too many requests, please try again later.' });
        }
        return next();
    };
}
exports.rateLimit = rateLimit;
// Preconfigured limiters
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    keyGenerator: (req) => { var _a; return `${req.ip}:${String(((_a = req.body) === null || _a === void 0 ? void 0 : _a.email) || '').toLowerCase()}`; },
    message: 'Too many login attempts. Please try again later.',
});
exports.registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    keyGenerator: (req) => req.ip || 'unknown',
    message: 'Too many sign-up attempts from this IP. Please try again later.',
});
exports.forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => { var _a; return `${req.ip || 'unknown'}:${String(((_a = req.body) === null || _a === void 0 ? void 0 : _a.email) || '').toLowerCase()}`; },
    message: 'Too many password reset requests. Please try again later.',
});
