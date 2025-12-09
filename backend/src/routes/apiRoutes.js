import { Router } from "express";
import User from "../models/User.js";
import Vibe from "../models/Vibe.js";

const router = Router();

// Get global stats
router.get("/stats/global", async (req, res) => {
  try {
    const [totalUsers, totalVibes] = await Promise.all([
      User.countDocuments(),
      Vibe.countDocuments({ isVisible: true })
    ]);

    res.json({
      totalUsers,
      totalVibes
    });
  } catch (error) {
    console.error("Error fetching global stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// Get trending tags
router.get("/tags/trending", async (req, res) => {
  try {
    const pipeline = [
      { $match: { isVisible: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: "$_id", count: 1, _id: 0 } }
    ];

    const tags = await Vibe.aggregate(pipeline);
    
    // Add trend indicators (mock for now, could be based on time comparisons)
    const tagsWithTrends = tags.map((tag, index) => ({
      ...tag,
      trend: index < 3 ? 'up' : index > 6 ? 'down' : 'stable'
    }));

    res.json({ tags: tagsWithTrends });
  } catch (error) {
    console.error("Error fetching trending tags:", error);
    res.status(500).json({ message: "Error fetching trending tags" });
  }
});

// Get top users
router.get("/users/top", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const pipeline = [
      {
        $lookup: {
          from: "vibes",
          localField: "_id",
          foreignField: "recipientId",
          as: "receivedVibes"
        }
      },
      {
        $project: {
          name: 1,
          handle: 1,
          avatarUrl: 1,
          vibeCount: { $size: "$receivedVibes" }
        }
      },
      { $sort: { vibeCount: -1 } },
      { $limit: limit }
    ];

    const users = await User.aggregate(pipeline);
    res.json({ users });
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ message: "Error fetching top users" });
  }
});

// Get public vibes
router.get("/vibes/public", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || 'recent';

    let sortCriteria = { createdAt: -1 }; // Default to recent
    let filter = { isVisible: true };

    if (type === 'popular') {
      sortCriteria = { 'reactions.length': -1, createdAt: -1 };
    } else if (type === 'wednesday' && new Date().getDay() === 3) {
      // Only show today's vibes on Wednesday
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: today };
    }

    const vibes = await Vibe.find(filter)
      .populate('senderId', 'name handle avatarUrl')
      .populate('recipientId', 'name handle')
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ items: vibes });
  } catch (error) {
    console.error("Error fetching public vibes:", error);
    res.status(500).json({ message: "Error fetching vibes" });
  }
});

// ✅ NEW: Search users and vibes
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query.trim()) {
      return res.json({ users: [], vibes: [] });
    }

    const users = await User.find({
      $or: [
        { handle: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name handle avatarUrl bio')
    .limit(20)
    .lean();

    const vibes = await Vibe.find({
      isVisible: true,
      $or: [
        { text: { $regex: query, $options: 'i' } },
        { tags: { $in: [query.toLowerCase()] } }
      ]
    })
    .populate('senderId', 'name handle avatarUrl')
    .populate('recipientId', 'name handle avatarUrl')
    .limit(20)
    .lean();

    res.json({ users, vibes });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get leaderboard for vibes
router.get("/leaderboard/vibes", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'all';
    let dateFilter = {};

    const now = new Date();
    switch (timeframe) {
      case 'day':
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
    }

    const matchStage = { isVisible: true };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    const pipeline = [
      { $match: matchStage },
      { $group: { 
        _id: "$recipientId",
        vibeCount: { $sum: 1 },
        totalReactions: { $sum: { $size: "$reactions" } }
      }},
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          handle: "$user.handle",
          avatarUrl: "$user.avatarUrl",
          vibeCount: 1,
          slayScore: { $add: ["$vibeCount", { $multiply: ["$totalReactions", 0.5] }] }
        }
      },
      { $sort: { slayScore: -1, vibeCount: -1 } },
      { $limit: 20 }
    ];

    const leaders = await Vibe.aggregate(pipeline);
    res.json({ leaders });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

// Get leaderboard for wars
router.get("/leaderboard/wars", async (req, res) => {
  try {
    // This would need the VibeWar model to be implemented
    // For now, return empty array
    res.json({ leaders: [] });
  } catch (error) {
    console.error("Error fetching war leaderboard:", error);
    res.status(500).json({ message: "Error fetching war leaderboard" });
  }
});

// Get current vibe war
router.get("/vibe-wars/current", async (req, res) => {
  try {
    // For demo purposes, create a mock war
    // In production, this would fetch from database
    const mockWar = {
      _id: 'current',
      contestant1: {
        user: { name: 'User 1', handle: 'user1' },
        vibe: {
          text: 'You have amazing energy!',
          tags: ['energetic', 'inspiring'],
          votes: Math.floor(Math.random() * 50)
        }
      },
      contestant2: {
        user: { name: 'User 2', handle: 'user2' },
        vibe: {
          text: 'Your creativity is unmatched!',
          tags: ['creative', 'talented'],
          votes: Math.floor(Math.random() * 50)
        }
      },
      endsAt: new Date(Date.now() + 3600000).toISOString(),
      votes: []
    };

    res.json({ war: mockWar });
  } catch (error) {
    console.error("Error fetching current war:", error);
    res.status(500).json({ message: "Error fetching current war" });
  }
});

// Vote in vibe war
router.post("/vibe-wars/:id/vote", async (req, res) => {
  try {
    const { contestant } = req.body;
    // In production, this would update the database
    res.json({ success: true, message: 'Vote recorded' });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ message: "Error recording vote" });
  }
});

// Get war history
router.get("/vibe-wars/history", async (req, res) => {
  try {
    // Mock data for demo
    const history = [];
    res.json({ wars: history });
  } catch (error) {
    console.error("Error fetching war history:", error);
    res.status(500).json({ message: "Error fetching war history" });
  }
});

export default router;
