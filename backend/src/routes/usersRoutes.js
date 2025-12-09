// backend/src/routes/usersRoutes.js
import { Router } from "express";
import { body, param, query } from "express-validator";
import validate from "../middleware/validate.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

/**
 * ✅ GET /api/users
 * List all users (paginated, public)
 */
router.get(
  "/",
  [
    query("page").optional().toInt(),
    query("limit").optional().toInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const page = Math.max(1, req.query.page || 1);
      const limit = Math.min(50, Math.max(1, req.query.limit || 20));

      const [users, total] = await Promise.all([
        User.find()
          .select("name handle bio avatarUrl createdAt")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(),
      ]);

      res.json({
        users,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * ✅ GET /api/users/top
 * Return top users for Explore page (sorted by newest or slayScore later)
 */
router.get("/top", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const users = await User.find()
      .select("name handle bio avatarUrl createdAt")
      .sort({ createdAt: -1 }) // you can change this to { slayScore: -1 } later
      .limit(limit)
      .lean();

    res.json({ users });
  } catch (err) {
    console.error("Error fetching top users:", err);
    next(err);
  }
});

/**
 * ✅ GET /api/users/search
 * Search users by name or handle (for autocomplete)
 */
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q || "";
    if (!query.trim()) return res.json({ users: [] });

    const users = await User.find({
      $or: [
        { handle: { $regex: `^${query}`, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    })
      .select("name handle avatarUrl bio")
      .limit(10)
      .lean();

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

/**
 * ✅ GET /api/users/me
 * Return current logged-in user (private)
 */
router.get("/me", auth, async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        handle: req.user.handle,
        bio: req.user.bio,
        avatarUrl: req.user.avatarUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * ✅ PUT /api/users/me
 * Update your own name/bio/avatarUrl
 */
router.put(
  "/me",
  auth,
  [
    body("name").optional().isLength({ min: 2, max: 40 }),
    body("bio").optional().isLength({ max: 200 }),
    body("avatarUrl")
      .optional()
      .isURL()
      .withMessage("avatarUrl must be a valid URL"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, bio, avatarUrl } = req.body;
      if (name !== undefined) req.user.name = name;
      if (bio !== undefined) req.user.bio = bio;
      if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
      await req.user.save();
      res.json({
        message: "Profile updated",
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          handle: req.user.handle,
          bio: req.user.bio,
          avatarUrl: req.user.avatarUrl,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * ✅ GET /api/users/:handle
 * Public profile by handle
 */
router.get(
  "/:handle",
  [param("handle").isLength({ min: 2 })],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        handle: req.params.handle.toLowerCase(),
      }).select("name handle bio avatarUrl createdAt");

      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
