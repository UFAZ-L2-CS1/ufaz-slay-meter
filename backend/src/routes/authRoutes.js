import { Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

// Helper function to sign JWTs
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
}

// @route   POST /api/auth/register
router.post(
  "/register",
  [
    body("name").isLength({ min: 2 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });

      const token = signToken(user._id);
      res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email },
        token,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

// @route   POST /api/auth/logout
router.post("/logout", auth, (req, res) => {
  // For localStorage-based tokens, client should just remove the token
  // This route is just for confirmation
  res.json({ message: "Logged out successfully" });
});

export default router;
