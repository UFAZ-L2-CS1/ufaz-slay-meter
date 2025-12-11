// backend/src/routes/profileRoutes.js
import { Router } from "express";
import { body, param } from "express-validator";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import User from "../models/User.js";
import Vibe from "../models/Vibe.js";

const router = Router();

/**
 * ✅ BASE ROUTE: GET /api/profile
 * Just returns a simple message (prevents "Cannot GET /api/profile")
 */
router.get("/", (req, res) => {
  res.json({
    message: "Profile API is alive ✅ Use /me or /:handle endpoints.",
  });
});

/**
 * GET /api/profile/me
 * Return current authenticated user's public data WITH STATS
 */
router.get("/me", auth, async (req, res, next) => {
  try {
    const u = req.user;

    // Calculate stats for current user
    const [vibesReceived, vibesSent, tagStats] = await Promise.all([
      Vibe.countDocuments({
        recipientId: u._id,
        isVisible: true,
      }),
      Vibe.countDocuments({
        senderId: u._id,
        isVisible: true,
      }),
      // Get tag distribution
      Vibe.aggregate([
        { $match: { recipientId: u._id, isVisible: true } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Calculate percentages for tags
    const totalTagCount = tagStats.reduce((sum, tag) => sum + tag.count, 0);
    const topTags = tagStats.map(tag => ({
      tag: tag._id,
      count: tag.count,
      pct: totalTagCount > 0 ? Math.round((tag.count / totalTagCount) * 100) : 0
    }));

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
        stats: {
          vibesReceived,
          vibesSent,
          slayScore: vibesReceived * 10,
          topTags
        }
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/profile/:handle
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

      // Calculate comprehensive stats
      const [vibesReceived, vibesSent, tagStats] = await Promise.all([
        Vibe.countDocuments({
          recipientId: user._id,
          isVisible: true,
        }),
        Vibe.countDocuments({
          senderId: user._id,
          isVisible: true,
        }),
        // Get tag distribution
        Vibe.aggregate([
          { $match: { recipientId: user._id, isVisible: true } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
      ]);

      // Calculate percentages for tags
      const totalTagCount = tagStats.reduce((sum, tag) => sum + tag.count, 0);
      const topTags = tagStats.map(tag => ({
        tag: tag._id,
        count: tag.count,
        pct: totalTagCount > 0 ? Math.round((tag.count / totalTagCount) * 100) : 0
      }));

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
            vibesSent,
            slayScore: vibesReceived * 10,
            topTags
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
        if (exists)
          return res.status(400).json({ message: "Handle already in use" });
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
