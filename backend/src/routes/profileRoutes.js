// backend/src/routes/profileRoutes.js
import { Router } from "express";
import { body, param } from "express-validator";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import User from "../models/User.js";
import Vibe from "../models/Vibe.js";

const router = Router();

/**
 * GET /api/profile/me
 * Return current authenticated user's public data
 */
router.get("/me", auth, async (req, res, next) => {
  try {
    const u = req.user;
    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        handle: u.handle,
        bio: u.bio,
        avatarUrl: u.avatarUrl,
        links: u.links,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ NEW: GET /api/profile/:handle
 * Get public profile by handle with stats
 */
router.get(
  "/:handle",
  [param("handle").isLength({ min: 2, max: 30 })],
  validate,
  async (req, res, next) => {
    try {
      const handle = req.params.handle.toLowerCase().trim();
      const user = await User.findOne({ handle }).select("-password");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's vibes count
      const vibesReceived = await Vibe.countDocuments({
        recipientId: user._id,
        isVisible: true,
      });

      res.json({
        user: {
          id: user._id,
          name: user.name,
          handle: user.handle,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          links: user.links,
          createdAt: user.createdAt,
          stats: {
            vibesReceived,
            slayScore: vibesReceived * 10,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/profile
 * Update current user's profile fields
 */
router.patch(
  "/",
  auth,
  [
    body("name").optional().isLength({ min: 2, max: 60 }),
    body("handle")
      .optional()
      .isLength({ min: 2, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Handle may contain letters, numbers, underscores only."),
    body("bio").optional().isLength({ max: 240 }),
    body("avatarUrl").optional().isURL().withMessage("avatarUrl must be a URL"),
    body("links.instagram").optional().isURL(),
    body("links.tiktok").optional().isURL(),
    body("links.website").optional().isURL(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const updates = {};
      const { name, handle, bio, avatarUrl, links } = req.body;

      if (name !== undefined) updates.name = name.trim();
      if (bio !== undefined) updates.bio = bio.trim();
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl.trim();
      if (links !== undefined) updates.links = links;

      if (handle !== undefined) {
        const normalized = handle.trim().toLowerCase();
        const exists = await User.findOne({
          handle: normalized,
          _id: { $ne: req.user._id },
        });
        if (exists) return res.status(400).json({ message: "Handle already in use" });
        updates.handle = normalized;
      }

      const updated = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
