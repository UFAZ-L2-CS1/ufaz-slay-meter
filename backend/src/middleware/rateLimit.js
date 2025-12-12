// backend/src/middleware/rateLimit.js
import rateLimit from "express-rate-limit";

/**
 * General API limiter — applies to all routes (optional global safety net)
 * Limits general traffic to 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: {
    message: "Too many requests, please try again later."
  },
  standardHeaders: true, // Adds `RateLimit-*` headers
  legacyHeaders: false, // Disable old `X-RateLimit-*` headers
});

/**
 * Stricter limiter for authentication endpoints (login/register)
 * Prevents brute-force login attempts
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 auth requests per minute
  message: {
    message: "Too many auth attempts. Try again in a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Anonymous Vibe limiter — for POST /api/vibes/anon
 * Prevents spammy anonymous vibe submissions
 */
export const anonVibeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 anonymous submissions per 10 minutes per IP
  message: {
    message: "Slow down—too many anonymous vibes. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * War voting limiter — for POST /api/wars/:id/vote
 * Prevents vote spam during wars (5 votes per 5 minutes per IP)
 */
export const warVoteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 votes per 5 minutes per IP
  message: {
    message: "Too many votes. Wait 5 minutes before voting again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
