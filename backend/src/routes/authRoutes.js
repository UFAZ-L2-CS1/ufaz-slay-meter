import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();
router.get("/", (req, res) => {
  res.json({
    message: "Auth API is alive ✅ Use /login, /register, /me, or /logout endpoints.",
  });
});
// --- Helper to sign JWTs ---
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
}

// --- Helper to hide sensitive fields ---
function publicUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    handle: u.handle,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    links: u.links,
    createdAt: u.createdAt,
  };
}

// --- POST /api/auth/register ---
router.post(
  "/register",
  [
    body("name").isLength({ min: 2, max: 60 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("handle")
      .optional()
      .isLength({ min: 2, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Handle may contain only letters, numbers, and underscores."),
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: errors.array()[0].msg,
          errors: errors.array() 
        });
      }

      const { name, email, password, handle } = req.body;

      // --- Check for duplicates ---
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail)
        return res.status(400).json({ message: "Email already registered" });

      if (handle) {
        const existingHandle = await User.findOne({
          handle: handle.trim().toLowerCase(),
        });
        if (existingHandle)
          return res.status(400).json({ message: "Handle already in use" });
      }

      // --- Create new user ---
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password, // hashed automatically in pre-save hook
        handle: handle ? handle.trim().toLowerCase() : undefined,
      });

      await user.save();
      const token = signToken(user._id);
      res.status(201).json({ user: publicUser(user), token });
    } catch (err) {
      console.error("Registration error:", err);
      next(err);
    }
  }
);

// --- POST /api/auth/login ---
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: (email || "").toLowerCase().trim(),
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({ user: publicUser(user), token });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
});

// --- GET /api/auth/me (protected) ---
router.get("/me", auth, async (req, res, next) => {
  try {
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/auth/logout ---
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

export default router;
