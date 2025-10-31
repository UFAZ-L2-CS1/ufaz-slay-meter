import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js"; // ✅ import this

dotenv.config();

const app = express();
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Healthcheck route
app.get("/health", (req, res) => {
  res.json({ ok: true, db: !!mongoose?.connection?.readyState });
});

// API routes
app.use("/api/auth", authRoutes);

// ✅ Optional: handle unknown routes (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler — must be last
app.use(errorHandler);

// Start server after DB connects
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
