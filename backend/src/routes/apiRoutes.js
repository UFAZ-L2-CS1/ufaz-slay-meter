import { Router } from "express";
import User from "../models/User.js";
import Vibe from "../models/Vibe.js";
import War from "../models/War.js";
import auth from "../middleware/auth.js";

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

// ✅ NEW: Get current user's dashboard stats
router.get("/users/me/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalVibes = await Vibe.countDocuments({
      recipientId: userId,
      isVisible: true
    });

    const tagsPipeline = [
      { $match: { recipientId: userId, isVisible: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ];

    const tagStats = await Vibe.aggregate(tagsPipeline);

    const totalTagCount = tagStats.reduce((sum, tag) => sum + tag.count, 0);
    const stats = tagStats.map(tag => ({
      tag: tag._id,
      count: tag.count,
      pct: totalTagCount > 0 ? Math.round((tag.count / totalTagCount) * 100) : 0
    }));

    const allUsers = await Vibe.aggregate([
      { $match: { isVisible: true } },
      {
        $group: {
          _id: "$recipientId",
          vibeCount: { $sum: 1 }
        }
      },
      { $sort: { vibeCount: -1 } }
    ]);

    const userRank =
      allUsers.findIndex(u => u._id.toString() === userId.toString()) + 1;

    res.json({
      totalVibes,
      rank: userRank > 0 ? userRank : null,
      totalUsers: allUsers.length,
      stats,
      top3: stats.slice(0, 3)
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Error fetching user stats" });
  }
});

// ✅ NEW: Get vibes received by current user
router.get("/vibes/received", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const vibes = await Vibe.find({
      recipientId: req.user._id,
      isVisible: true
    })
      .populate("senderId", "name handle avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedVibes = vibes.map(vibe => ({
      ...vibe,
      from: vibe.senderId,
      timestamp: formatRelativeTime(vibe.createdAt),
      anonymous: vibe.isAnonymous
    }));

    res.json({ vibes: formattedVibes });
  } catch (error) {
    console.error("Error fetching received vibes:", error);
    res.status(500).json({ message: "Error fetching vibes" });
  }
});

// ✅ NEW: Get vibes sent by current user
router.get("/vibes/sent", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const vibes = await Vibe.find({
      senderId: req.user._id,
      isVisible: true
    })
      .populate("recipientId", "name handle avatarUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedVibes = vibes.map(vibe => ({
      ...vibe,
      to: vibe.recipientId,
      timestamp: formatRelativeTime(vibe.createdAt),
      anonymous: vibe.isAnonymous
    }));

    res.json({ vibes: formattedVibes });
  } catch (error) {
    console.error("Error fetching sent vibes:", error);
    res.status(500).json({ message: "Error fetching vibes" });
  }
});

// Helper function to format relative time
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
}

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

    const tagsWithTrends = tags.map((tag, index) => ({
      ...tag,
      trend: index < 3 ? "up" : index > 6 ? "down" : "stable"
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
    const type = req.query.type || "recent";

    let sortCriteria = { createdAt: -1 };
    let filter = { isVisible: true };

    if (type === "popular") {
      sortCriteria = { "reactions.length": -1, createdAt: -1 };
    } else if (type === "wednesday" && new Date().getDay() === 3) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: today };
    }

    const vibes = await Vibe.find(filter)
      .populate("senderId", "name handle avatarUrl")
      .populate("recipientId", "name handle")
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ items: vibes });
  } catch (error) {
    console.error("Error fetching public vibes:", error);
    res.status(500).json({ message: "Error fetching vibes" });
  }
});

// Search users and vibes
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";

    if (!query.trim()) {
      return res.json({ users: [], vibes: [] });
    }

    const users = await User.find({
      $or: [
        { handle: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ]
    })
      .select("name handle avatarUrl bio")
      .limit(20)
      .lean();

    const vibes = await Vibe.find({
      isVisible: true,
      $or: [
        { text: { $regex: query, $options: "i" } },
        { tags: { $in: [query.toLowerCase()] } }
      ]
    })
      .populate("senderId", "name handle avatarUrl")
      .populate("recipientId", "name handle avatarUrl")
      .limit(20)
      .lean();

    res.json({ users, vibes });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

// Get leaderboard for vibes
router.get("/leaderboard/vibes", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "all";
    let dateFilter = {};

    const now = new Date();
    switch (timeframe) {
      case "day":
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case "week":
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case "month":
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
    }

    const matchStage = { isVisible: true };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$recipientId",
          vibeCount: { $sum: 1 },
          totalReactions: { $sum: { $size: "$reactions" } }
        }
      },
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
          slayScore: {
            $add: ["$vibeCount", { $multiply: ["$totalReactions", 0.5] }]
          }
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

// ✅ FIXED: Get leaderboard for wars - aggregates per-user war stats
router.get("/leaderboard/wars", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "all";
    let dateFilter = {};

    const now = new Date();
    switch (timeframe) {
      case "day":
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case "week":
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case "month":
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
    }

    const matchStage = { status: "ended", winner: { $ne: null } };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.endTime = dateFilter;
    }

    // Fetch all ended wars with winners
    const wars = await War.find(matchStage)
      .populate("contestant1.userId", "name handle avatarUrl")
      .populate("contestant2.userId", "name handle avatarUrl")
      .lean();

    // Build user war stats map
    const userStatsMap = {};

    wars.forEach(war => {
      const winner =
        war.winner === 1 ? war.contestant1.userId : war.contestant2.userId;
      const loser =
        war.winner === 1 ? war.contestant2.userId : war.contestant1.userId;

      if (winner && winner._id) {
        const wid = winner._id.toString();
        if (!userStatsMap[wid]) {
          userStatsMap[wid] = {
            id: winner._id,
            name: winner.name,
            handle: winner.handle,
            avatarUrl: winner.avatarUrl || "",
            warsWon: 0,
            warsLost: 0,
            totalWars: 0
          };
        }
        userStatsMap[wid].warsWon += 1;
        userStatsMap[wid].totalWars += 1;
      }

      if (loser && loser._id) {
        const lid = loser._id.toString();
        if (!userStatsMap[lid]) {
          userStatsMap[lid] = {
            id: loser._id,
            name: loser.name,
            handle: loser.handle,
            avatarUrl: loser.avatarUrl || "",
            warsWon: 0,
            warsLost: 0,
            totalWars: 0
          };
        }
        userStatsMap[lid].warsLost += 1;
        userStatsMap[lid].totalWars += 1;
      }
    });

    // Convert to array and calculate win rates
    const leaders = Object.values(userStatsMap).map(user => ({
      ...user,
      winRate:
        user.totalWars > 0
          ? Math.round((user.warsWon / user.totalWars) * 100)
          : 0
    }));

    // Sort by wars won, then by win rate
    leaders.sort((a, b) => {
      if (b.warsWon !== a.warsWon) return b.warsWon - a.warsWon;
      return b.winRate - a.winRate;
    });

    // Return top 20
    res.json({ leaders: leaders.slice(0, 20) });
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
      _id: "current",
      contestant1: {
        user: { name: "User 1", handle: "user1" },
        vibe: {
          text: "You have amazing energy!",
          tags: ["energetic", "inspiring"],
          votes: Math.floor(Math.random() * 50)
        }
      },
      contestant2: {
        user: { name: "User 2", handle: "user2" },
        vibe: {
          text: "Your creativity is unmatched!",
          tags: ["creative", "talented"],
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
    res.json({ success: true, message: "Vote recorded" });
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
