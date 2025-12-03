// src/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    let token = null;

    // Accept "Bearer <token>" (case-insensitive)
    if (/^bearer\s/i.test(header)) {
      token = header.slice(7).trim();
    }

    // Optional cookie support
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    // Verify token (defaults to HS256). Add issuer/audience if you use them.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Enforce a consistent payload shape: { id: "<mongoId>" }
    if (!payload?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Load user (without password)
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach to request for downstream handlers
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
}
