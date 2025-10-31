import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware: verifies JWT and loads the user
export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    let token = null;

    // Get token from Authorization header (Bearer <token>)
    if (header.toLowerCase().startsWith("bearer ")) {
      token = header.slice(7).trim();
    }

    // Optional: also support cookie token (future use)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user ID from the decoded payload
    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Find user in DB
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token (user not found)" });
    }

    // Attach to request
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
