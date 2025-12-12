// backend/src/middleware/rateLimit.js
import rateLimit from "express-rate-limit";

/**
 * General API limiter — optional global safety net.
 * In development it is disabled to avoid 429 spam.
 * Enable in production by wiring it in server.js if needed.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requests per 15 minutes per IP
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter limiter for authentication endpoints (login/register).
 * Thresholds are relaxed a bit for local testing.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,             // allow up to 50 auth requests per minute per IP
  message: { message: "Too many auth attempts. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Anonymous Vibe limiter — for POST /api/vibes/anon.
 */
export const anonVibeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                   // 5 anonymous submissions per 10 minutes per IP
  message: {
    message: "Slow down—too many anonymous vibes. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
