// backend/src/server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import vibeRoutes from "./routes/vibeRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js"; // ⬅️ add authLimiter

dotenv.config();

const app = express();

// --- CORS ---
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
  })
);

// --- Common middleware ---
app.use(express.json());
app.use(cookieParser());

// --- Global (soft) rate limiter for all routes ---
app.use(apiLimiter);

// --- Healthcheck ---
app.get("/health", (_req, res) => {
  res.json({ ok: true, db: !!mongoose?.connection?.readyState });
});

// --- API routes ---
// apply stricter limiter only for auth endpoints
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/vibes", vibeRoutes);

// --- Centralized error handler (MUST be last) ---
app.use(errorHandler);

// --- Start server after DB ---
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
