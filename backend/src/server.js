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
import exploreRoutes from "./routes/exploreRoutes.js";
import warsRoutes from "./routes/warsRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";
import { initWarScheduler } from "./middleware/warScheduler.js"; // ✅ düzgün path

dotenv.config();
const app = express();

// --- CORS ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("🚫 Blocked by CORS:", origin);
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

// ✅ ROUTES ORDER (very important)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/wars", warsRoutes);

// ✅ General /api routes LAST (catch-all)
app.use("/api", apiRoutes);

// --- Centralized error handler ---
app.use(errorHandler);

// --- Start server after DB connection ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  console.log("✅ MongoDB connected");

  // ✅ War scheduler-i işə sal
  initWarScheduler();

  // ✅ Serveri başlat
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
