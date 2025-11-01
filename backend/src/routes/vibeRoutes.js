// backend/src/routes/vibeRoutes.js
import { Router } from "express";
import { body, param, query } from "express-validator";
import validate from "../middleware/validate.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Vibe, { REACTION_TYPES } from "../models/Vibe.js";
import { anonVibeLimiter } from "../middleware/rateLimit.js";

const router = Router();

/** Helper: find recipient by handle */
async function findRecipientByHandle(handle) {
  const u = await User.findOne({ handle: (handle || "").toLowerCase().trim() });
  return u;
}

/** Normalize tags array (lowercase, dedupe, length <= 15 per tag) */
function normalizeTags(tags = []) {
  const cleaned = (Array.isArray(tags) ? tags : [])
    .map((t) => String(t || "").toLowerCase().trim().slice(0, 15))
    .filter(Boolean);
  return [...new Set(cleaned)].slice(0, 8); // max 8 tags
}

/** 1) POST /api/vibes  — logged-in sender */
router.post(
  "/",
  auth,
  [
    body("recipientHandle").isString().isLength({ min: 2, max: 30 }),
    body("text").isString().isLength({ min: 1, max: 280 }),
    body("tags").optional().isArray(),
    body("emojis").optional().isArray(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { recipientHandle, text, tags = [], emojis = [] } = req.body;

      const recipient = await findRecipientByHandle(recipientHandle);
      if (!recipient) return res.status(404).json({ message: "Recipient not found" });
      if (String(recipient._id) === String(req.user._id)) {
        return res.status(400).json({ message: "You can’t send a vibe to yourself" });
      }

      const vibe = await Vibe.create({
        recipientId: recipient._id,
        senderId: req.user._id,
        isAnonymous: false,
        text: text.trim(),
        tags: normalizeTags(tags),
        emojis: (Array.isArray(emojis) ? emojis : []).slice(0, 8),
      });

      res.status(201).json({ vibe });
    } catch (e) {
      next(e);
    }
  }
);

/** 2) POST /api/vibes/anon  — anonymous sender (no auth, rate-limited) */
router.post(
  "/anon",
  anonVibeLimiter,
  [
    body("recipientHandle").isString().isLength({ min: 2, max: 30 }),
    body("text").isString().isLength({ min: 1, max: 280 }),
    body("tags").optional().isArray(),
    body("emojis").optional().isArray(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { recipientHandle, text, tags = [], emojis = [] } = req.body;

      const recipient = await findRecipientByHandle(recipientHandle);
      if (!recipient) return res.status(404).json({ message: "Recipient not found" });

      const vibe = await Vibe.create({
        recipientId: recipient._id,
        senderId: null,
        isAnonymous: true,
        text: text.trim(),
        tags: normalizeTags(tags),
        emojis: (Array.isArray(emojis) ? emojis : []).slice(0, 8),
      });

      res.status(201).json({ vibe });
    } catch (e) {
      next(e);
    }
  }
);

/** 3) GET /api/vibes/user/:handle  — list recipient’s vibes (paginated) */
router.get(
  "/user/:handle",
  [param("handle").isString().isLength({ min: 2, max: 30 }), query("page").optional().toInt(), query("limit").optional().toInt()],
  validate,
  async (req, res, next) => {
    try {
      const { handle } = req.params;
      const page = Math.max(1, req.query.page || 1);
      const limit = Math.min(50, Math.max(1, req.query.limit || 10));
      const recipient = await findRecipientByHandle(handle);
      if (!recipient) return res.status(404).json({ message: "User not found" });

      const filter = { recipientId: recipient._id, isVisible: true };
      const [items, total] = await Promise.all([
        Vibe.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Vibe.countDocuments(filter),
      ]);

      res.json({
        items,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (e) {
      next(e);
    }
  }
);

/** 4) GET /api/vibes/user/:handle/stats  — tag frequency % */
router.get(
  "/user/:handle/stats",
  [param("handle").isString().isLength({ min: 2, max: 30 })],
  validate,
  async (req, res, next) => {
    try {
      const recipient = await findRecipientByHandle(req.params.handle);
      if (!recipient) return res.status(404).json({ message: "User not found" });

      const pipeline = [
        { $match: { recipientId: recipient._id, isVisible: true } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ];
      const rows = await Vibe.aggregate(pipeline);
      const total = rows.reduce((s, r) => s + r.count, 0) || 0;

      const stats = rows.map((r) => ({
        tag: r._id,
        count: r.count,
        pct: total ? Math.round((r.count / total) * 100) : 0,
      }));

      const top3 = stats.slice(0, 3);

      res.json({ totalTags: total, stats, top3 });
    } catch (e) {
      next(e);
    }
  }
);

/** 5) POST /api/vibes/:id/react  — toggle reaction by current user */
router.post(
  "/:id/react",
  auth,
  [
    param("id").isMongoId(),
    body("type").isString().custom((v) => REACTION_TYPES.includes(v)),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { type } = req.body;

      const vibe = await Vibe.findById(id);
      if (!vibe) return res.status(404).json({ message: "Vibe not found" });

      // if user already reacted with the same type → remove; otherwise upsert
      const idx = vibe.reactions.findIndex(
        (r) => String(r.userId) === String(req.user._id) && r.type === type
      );
      if (idx >= 0) {
        vibe.reactions.splice(idx, 1);
      } else {
        // remove other reaction types by same user (1 reaction at a time policy)
        vibe.reactions = vibe.reactions.filter(
          (r) => String(r.userId) !== String(req.user._id)
        );
        vibe.reactions.push({ userId: req.user._id, type });
      }

      await vibe.save();
      res.json({ reactions: vibe.reactions });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
