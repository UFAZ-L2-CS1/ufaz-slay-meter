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
    res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, handle: req.user.handle, bio: req.user.bio, avatarUrl: req.user.avatarUrl }});
  } catch (err) { next(err); }
});

/**
 * PUT /api/users/me
 * Update name/bio/avatarUrl (private)
 */
router.put(
  "/me",
  auth,
  [
    body("name").optional().isLength({ min: 2, max: 40 }),
    body("bio").optional().isLength({ max: 200 }),
    body("avatarUrl").optional().isURL().withMessage("avatarUrl must be a URL"),
  ],
  async (req, res, next) => {
    try {
      const { name, bio, avatarUrl } = req.body;
      if (name !== undefined) req.user.name = name;
      if (bio !== undefined) req.user.bio = bio;
      if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
      await req.user.save();
      res.json({ message: "Profile updated", user: { id: req.user._id, name: req.user.name, email: req.user.email, handle: req.user.handle, bio: req.user.bio, avatarUrl: req.user.avatarUrl }});
    } catch (err) { next(err); }
  }
);

/**
 * ✅ NEW: GET /api/users/search
 * Search users by name or handle (for autocomplete)
 */
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q || '';
    
    if (!query.trim()) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { handle: { $regex: `^${query}`, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name handle avatarUrl bio')
    .limit(10)
    .lean();

    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

/**
 * ✅ FIXED: GET /api/users/:handle
 * Public profile by handle (changed from username to handle)
 */
router.get(
  "/:handle",
  [param("handle").isLength({ min: 2 })],
  async (req, res, next) => {
    try {
      const user = await User.findOne({ handle: req.params.handle.toLowerCase() })
        .select("name handle bio avatarUrl createdAt");
      
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ user });
    } catch (err) { next(err); }
  }
);

export default router;
