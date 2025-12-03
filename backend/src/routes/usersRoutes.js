import { Router } from "express";
import { body, param } from "express-validator";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

/**
 * GET /api/users/me
 * Return current user (private)
 */
router.get("/me", auth, async (req, res, next) => {
  try {
    // req.user comes from auth middleware
    res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, bio: req.user.bio, profilePicture: req.user.profilePicture }});
  } catch (err) { next(err); }
});

/**
 * PUT /api/users/me
 * Update name/bio/profilePicture (private)
 */
router.put(
  "/me",
  auth,
  [
    body("name").optional().isLength({ min: 2, max: 40 }),
    body("bio").optional().isLength({ max: 200 }),
    body("profilePicture").optional().isURL().withMessage("profilePicture must be a URL"),
  ],
  async (req, res, next) => {
    try {
      const { name, bio, profilePicture } = req.body;
      if (name !== undefined) req.user.name = name;
      if (bio !== undefined) req.user.bio = bio;
      if (profilePicture !== undefined) req.user.profilePicture = profilePicture;
      await req.user.save();
      res.json({ message: "Profile updated", user: { id: req.user._id, name: req.user.name, email: req.user.email, bio: req.user.bio, profilePicture: req.user.profilePicture }});
    } catch (err) { next(err); }
  }
);

/**
 * GET /api/users/:username
 * Public profile by username (no auth)
 */
router.get(
  "/:username",
  [param("username").isLength({ min: 2 })],
  async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.params.username }).select("username name bio profilePicture createdAt");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ user });
    } catch (err) { next(err); }
  }
);

export default router;
