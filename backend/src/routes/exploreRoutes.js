// backend/src/routes/exploreRoutes.js
import { Router } from "express";
import Vibe from "../models/Vibe.js";
import User from "../models/User.js";

const router = Router();

// Get explore page data
router.get("/", async (req, res) => {
  try {
    const type = req.query.type || 'recent';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // ✅ Fetch real users from database
    const users = await User.find()
      .select('name handle avatarUrl bio')
      .limit(20)
      .lean();
    
    let sortCriteria = { createdAt: -1 };
    let filter = { isVisible: true };
    
    if (type === 'popular') {
      sortCriteria = { 'reactions.length': -1, createdAt: -1 };
    } else if (type === 'wednesday' && new Date().getDay() === 3) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: today };
    }
    
    const [vibes, totalVibes, trendingTags] = await Promise.all([
      Vibe.find(filter)
        .populate('senderId', 'name handle avatarUrl')
        .populate('recipientId', 'name handle avatarUrl')
        .sort(sortCriteria)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      
      Vibe.countDocuments(filter),
      
      // Get trending tags
      Vibe.aggregate([
        { $match: { isVisible: true } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      users,  // ✅ Now returns real users
      recentVibes: vibes,
      vibes,
      page,
      limit,
      total: totalVibes,
      pages: Math.ceil(totalVibes / limit),
      trendingTags: trendingTags.map(t => ({ tag: t._id, count: t.count }))
    });
  } catch (error) {
    console.error("Error fetching explore data:", error);
    res.status(500).json({ message: "Error fetching explore data" });
  }
});

export default router;
