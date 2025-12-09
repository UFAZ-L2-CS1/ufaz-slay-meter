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
import usersRoutes from "./routes/usersRoutes.js";   // 🧩 ADD THIS LINE
import apiRoutes from "./routes/apiRoutes.js";
import warsRoutes from "./routes/warsRoutes.js";
import exploreRoutes from "./routes/exploreRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";

dotenv.config();

const app = express();

// --- CORS ---
const allowedOrigins = [
  'https://ufaz-slay-meter-2-nginx.onrender.com',
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log('⚠️ CORS blocked origin:', origin);
      callback(null, true);
    },
    credentials: true,
  })
);

// --- Common middleware ---
app.use(express.json());
app.use(cookieParser());

// --- Global (soft) rate limiter ---
app.use(apiLimiter);

// --- Health check ---
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    db: !!mongoose?.connection?.readyState,
    message: "Backend is healthy"
  });
});

// --- Test route ---
app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from backend!",
    instance: process.env.PORT || "unknown",
    timestamp: new Date().toISOString()
  });
});

// --- API routes ---
app.use("/api", apiRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/users", usersRoutes);    // 🧩 ADD THIS LINE
app.use("/api/wars", warsRoutes);
app.use("/api/explore", exploreRoutes);

// --- Error handler ---
app.use(errorHandler);

// --- Start server ---
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
