// backend/src/routes/warsRoutes.js
import { Router } from "express";
import { body, param } from "express-validator";
import validate from "../middleware/validate.js";
import auth from "../middleware/auth.js";
import War from "../models/War.js";
import User from "../models/User.js";
import Vibe from "../models/Vibe.js";

const router = Router();

/**
 * Today's war schedule – must match warScheduler
 */
function getTodayWarSchedule() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start at 11:10:00 local day
  const startTime = new Date(today);
  startTime.setHours(11, 10, 0, 0);

  // End at end of the same day
  const endTime = new Date(today);
  endTime.setHours(23, 59, 59, 999);

  return { startTime, endTime };
}

/**
 * Select 2 DIFFERENT random users with vibes
 * Prevents same user appearing multiple times
 */
async function selectRandomContestants() {
  // Get all users with visible vibes
  const usersWithVibes = await Vibe.aggregate([
    { $match: { isVisible: true } },
    { $group: { _id: "$recipientId", vibeCount: { $sum: 1 } } },
    { $match: { vibeCount: { $gte: 1 } } },
  ]);

  if (usersWithVibes.length < 2) {
    throw new Error("Not enough users with vibes to create a war");
  }

  // Shuffle the array to get truly random selection
  const shuffled = usersWithVibes.sort(() => Math.random() - 0.5);
  
  // Take first 2 users
  const userId1 = shuffled[0]._id;
  const userId2 = shuffled[1]._id;

  // Make sure they're different
  if (String(userId1) === String(userId2)) {
    throw new Error("Cannot select same user twice");
  }

  // Get random vibes for each user
  const vibes1 = await Vibe.find({ 
    recipientId: userId1, 
    isVisible: true 
  }).limit(10);
  
  const vibes2 = await Vibe.find({ 
    recipientId: userId2, 
    isVisible: true 
  }).limit(10);

  if (!vibes1.length || !vibes2.length) {
    throw new Error("Could not find vibes for selected users");
  }

  // Pick random vibe from each user's vibes
  const vibe1 = vibes1[Math.floor(Math.random() * vibes1.length)];
  const vibe2 = vibes2[Math.floor(Math.random() * vibes2.length)];

  console.log("✅ Selected contestants:", {
    user1: userId1.toString(),
    user2: userId2.toString(),
    vibe1: vibe1._id.toString(),
    vibe2: vibe2._id.toString(),
  });

  return {
    contestant1: { userId: userId1, vibeId: vibe1._id },
    contestant2: { userId: userId2, vibeId: vibe2._id },
  };
}

/**
 * Ensure today's war exists and has correct status
 */
async function ensureTodayWar() {
  const { startTime, endTime } = getTodayWarSchedule();
  const now = new Date();

  // Find war for today
  let war = await War.findOne({
    startTime: { $gte: startTime, $lte: endTime },
  });

  if (!war) {
    console.log("📅 Creating new war for today...");
    try {
      const contestants = await selectRandomContestants();
      
      // Determine initial status
      let status = "scheduled";
      if (now >= startTime && now < endTime) {
        status = "active";
      } else if (now >= endTime) {
        status = "ended";
      }

      war = await War.create({
        contestant1: contestants.contestant1,
        contestant2: contestants.contestant2,
        startTime,
        endTime,
        status,
      });
      
      console.log("✅ War created:", war._id, "Status:", status);
    } catch (error) {
      console.error("❌ Failed to create war:", error.message);
      throw error;
    }
  } else {
    // Update war status if needed
    let statusChanged = false;
    
    if (now >= endTime && war.status !== "ended") {
      war.status = "ended";
      if (war.winner === null || war.winner === undefined) {
        war.calculateWinner();
      }
      statusChanged = true;
    } else if (now >= startTime && now < endTime && war.status === "scheduled") {
      war.status = "active";
      statusChanged = true;
    }

    if (statusChanged) {
      await war.save();
      console.log("✅ War status updated:", war._id, "->", war.status);
    }
  }

  return war;
}

router.get("/", (req, res) => {
  res.json({
    message: "Wars API is alive ✅ Use /current or /history endpoints.",
  });
});

/**
 * Get current war
 */
router.get("/current", async (req, res) => {
  try {
    const war = await ensureTodayWar();

    await war.populate([
      { path: "contestant1.userId", select: "name handle avatarUrl" },
      { path: "contestant2.userId", select: "name handle avatarUrl" },
      { path: "contestant1.vibeId", select: "text tags emojis" },
      { path: "contestant2.vibeId", select: "text tags emojis" },
    ]);

    res.json({
      war: {
        _id: war._id,
        contestant1: {
          user: {
            name: war.contestant1.userId.name,
            handle: war.contestant1.userId.handle,
            avatarUrl: war.contestant1.userId.avatarUrl || "",
          },
          vibe: {
            text: war.contestant1.vibeId.text,
            tags: war.contestant1.vibeId.tags || [],
            emojis: war.contestant1.vibeId.emojis || [],
            votes: war.contestant1.votes,
          },
        },
        contestant2: {
          user: {
            name: war.contestant2.userId.name,
            handle: war.contestant2.userId.handle,
            avatarUrl: war.contestant2.userId.avatarUrl || "",
          },
          vibe: {
            text: war.contestant2.vibeId.text,
            tags: war.contestant2.vibeId.tags || [],
            emojis: war.contestant2.vibeId.emojis || [],
            votes: war.contestant2.votes,
          },
        },
        endsAt: war.endTime,
        startTime: war.startTime,
        status: war.status,
        votes: war.votes,
      },
    });
  } catch (error) {
    console.error("Error fetching current war:", error);
    res.status(500).json({ message: "Error fetching current war" });
  }
});

/**
 * Vote in war - PREVENTS DUPLICATE VOTING
 */
router.post(
  "/:id/vote",
  auth,
  [param("id").isMongoId(), body("contestant").isInt().isIn([1, 2])],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { contestant } = req.body;
      const userId = req.user._id;

      const war = await War.findById(id);
      if (!war) {
        return res.status(404).json({ message: "War not found" });
      }

      const now = new Date();
      
      // Check if war has ended
      if (now >= war.endTime || war.status === "ended") {
        return res.status(400).json({ message: "This war has ended" });
      }

      // Check if war has started
      if (now < war.startTime || war.status === "scheduled") {
        return res.status(400).json({ message: "This war hasn't started yet" });
      }

      // Prevent contestants from voting for themselves
      if (
        String(war.contestant1.userId) === String(userId) ||
        String(war.contestant2.userId) === String(userId)
      ) {
        return res.status(400).json({ 
          message: "You cannot vote in a war you're participating in" 
        });
      }

      // Check if user already voted - THIS IS THE KEY FIX
      const hasVoted = war.hasUserVoted(userId);
      if (hasVoted) {
        return res.status(400).json({ 
          message: "You have already voted in this war" 
        });
      }

      // Record the vote
      war.votes.push({
        userId,
        contestantNumber: contestant,
      });

      // Update vote count
      if (contestant === 1) {
        war.contestant1.votes += 1;
      } else {
        war.contestant2.votes += 1;
      }

      await war.save();

      console.log(`✅ Vote recorded: User ${userId} voted for contestant ${contestant}`);

      res.json({
        success: true,
        message: "Vote recorded",
        contestant,
        currentVotes: {
          contestant1: war.contestant1.votes,
          contestant2: war.contestant2.votes,
        },
      });
    } catch (error) {
      console.error("Error recording vote:", error);
      res.status(500).json({ message: "Error recording vote" });
    }
  }
);

/**
 * Check if user has voted in current war
 */
router.get("/current/my-vote", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const war = await ensureTodayWar();

    if (!war) {
      return res.json({ hasVoted: false, vote: null });
    }

    const userVote = war.getUserVote(userId);
    
    res.json({
      hasVoted: !!userVote,
      vote: userVote ? userVote.contestantNumber : null,
    });
  } catch (error) {
    console.error("Error checking vote status:", error);
    res.status(500).json({ message: "Error checking vote status" });
  }
});

/**
 * War history
 */
router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const wars = await War.find({ status: "ended" })
      .sort({ endTime: -1 })
      .limit(limit)
      .populate([
        { path: "contestant1.userId", select: "name handle avatarUrl" },
        { path: "contestant2.userId", select: "name handle avatarUrl" },
        { path: "contestant1.vibeId", select: "text" },
        { path: "contestant2.vibeId", select: "text" },
      ]);

    const history = wars.map((war) => {
      const totalVotes = war.contestant1.votes + war.contestant2.votes;

      if (war.winner === null || war.winner === undefined) {
        return {
          _id: war._id,
          winner: null,
          contestant1: {
            user: {
              name: war.contestant1.userId?.name || "Unknown",
              handle: war.contestant1.userId?.handle || "unknown",
              avatarUrl: war.contestant1.userId?.avatarUrl || "",
            },
            vibe: {
              text: war.contestant1.vibeId?.text || "",
              votes: war.contestant1.votes,
            },
          },
          contestant2: {
            user: {
              name: war.contestant2.userId?.name || "Unknown",
              handle: war.contestant2.userId?.handle || "unknown",
              avatarUrl: war.contestant2.userId?.avatarUrl || "",
            },
            vibe: {
              text: war.contestant2.vibeId?.text || "",
              votes: war.contestant2.votes,
            },
          },
          totalVotes,
          endedAt: war.endTime,
        };
      }

      const isWinner1 = war.winner === 1;
      const winnerContestant = isWinner1 ? war.contestant1 : war.contestant2;
      const loserContestant = isWinner1 ? war.contestant2 : war.contestant1;

      return {
        _id: war._id,
        winner: {
          user: {
            name: winnerContestant.userId?.name || "Unknown",
            handle: winnerContestant.userId?.handle || "unknown",
            avatarUrl: winnerContestant.userId?.avatarUrl || "",
          },
          vibe: {
            text: winnerContestant.vibeId?.text || "",
            votes: winnerContestant.votes,
          },
        },
        loser: {
          user: {
            name: loserContestant.userId?.name || "Unknown",
            handle: loserContestant.userId?.handle || "unknown",
            avatarUrl: loserContestant.userId?.avatarUrl || "",
          },
          vibe: {
            text: loserContestant.vibeId?.text || "",
            votes: loserContestant.votes,
          },
        },
        totalVotes,
        endedAt: war.endTime,
      };
    });

    res.json({ wars: history });
  } catch (error) {
    console.error("Error fetching war history:", error);
    res.status(500).json({ message: "Error fetching war history" });
  }
});

export default router;