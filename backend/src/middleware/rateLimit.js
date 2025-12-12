import rateLimit from "express-rate-limit";

/**
 * General API limiter — global safety net.
 * Relaxed for development so it almost never triggers.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                // allow 1000 requests per 15 minutes per IP
  message: {
    message: "Too many requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter limiter for authentication endpoints (login/register).
 * Completely disabled in development by setting a very high max.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 1000,            // effectively no limit for local testing
  message: {
    message: "Too many auth attempts. Try again in a minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Anonymous Vibe limiter — for POST /api/vibes/anon
 */
export const anonVibeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,                  // relaxed as well
  message: {
    message: "Slow down—too many anonymous vibes. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * War voting limiter — for POST /api/wars/:id/vote
 */
export const warVoteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50,                 // relaxed
  message: {
    message: "Too many votes. Wait 5 minutes before voting again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
