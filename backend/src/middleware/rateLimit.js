import rateLimit from "express-rate-limit";

// General API limiter — applies to overall routes (optional, used in server.js)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests per 15 minutes
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for authentication endpoints (login/register)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // Limit each IP to 10 auth requests per minute
  message: { message: "Too many auth attempts. Try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});
