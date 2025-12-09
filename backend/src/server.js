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
import userRoutes from "./routes/usersRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";  // ✅ ƏLAVƏ EDİLDİ
import warsRoutes from "./routes/warsRoutes.js";        // ✅ ƏLAVƏ EDİLDİ
import apiRoutes from "./routes/apiRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";

dotenv.config();
const app = express();

// --- CORS ---
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// --- Common middleware ---
app.use(express.json());
app.use(cookieParser());

// --- Global rate limiter ---
app.use(apiLimiter);

// --- Healthcheck ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: !!mongoose?.connection?.readyState });
});

// --- Test route ---
app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from backend!",
    instance: process.env.PORT || "unknown",
  });
});

// ✅ CRITICAL: Specific routes BEFORE catch-all /api route
// Route sıralaması çox vacibdir!
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/explore", exploreRoutes);   // ✅ ƏLAVƏ EDİLDİ
app.use("/api/wars", warsRoutes);         // ✅ ƏLAVƏ EDİLDİ

// ✅ General /api routes LAST (catch-all for stats, search, leaderboard, etc.)
app.use("/api", apiRoutes);

// --- Centralized error handler (MUST be last) ---
app.use(errorHandler);

// --- Start server after DB ---
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
