import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";

dotenv.config();

const app = express();

// CORS: single, controlled origin
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));

// Core middlewares
app.use(express.json());
app.use(cookieParser());

// Optional: apply a general API rate limiter
app.use("/api", apiLimiter);

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ ok: true, db: mongoose?.connection?.readyState === 1 });
});

// Routes
app.use("/api/auth", authRoutes);

// 404 handler (optional)
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// Central error handler (must be last)
app.use(errorHandler);

// Start server after DB connects
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
