// backend/src/routes/warsRoutes.js
import { Router } from "express";
import { body, param } from "express-validator";
import validate from "../middleware/validate.js";
import auth from "../middleware/auth.js";
import War from "../models/War.js";
import User from "../models/User.js";
import Vibe from "../models/Vibe.js";

const router = Router();

function getTodayWarSchedule() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startTime = new Date(today);
  startTime.setHours(9, 30, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setHours(10, 30, 0, 0);
  
  return { startTime, endTime };
}

async function selectRandomContestants() {
  const usersWithVibes = await Vibe.aggregate([
    { $match: { isVisible: true } },
    { $group: { _id: "$recipientId", vibeCount: { $sum: 1 } } },
    { $match: { vibeCount: { $gte: 1 } } },
    { $sample: { size: 2 } },
  ]);

  if (usersWithVibes.length < 2) {
    throw new Error("Not enough users with vibes to create a war");
  }

  const userId1 = usersWithVibes[0]._id;
  const userId2 = usersWithVibes[1]._id;

  const [vibe1] = await Vibe.find({ recipientId: userId1, isVisible: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .then((vibes) => vibes.sort(() => 0.5 - Math.random()).slice(0, 1));

  const [vibe2] = await Vibe.find({ recipientId: userId2, isVisible: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .then((vibes) => vibes.sort(() => 0.5 - Math.random()).slice(0, 1));

  if (!vibe1 || !vibe2) {
    throw new Error("Could not find vibes for selected users");
  }

  return {
    contestant1: { userId: userId1, vibeId: vibe1._id },
    contestant2: { userId: userId2, vibeId: vibe2._id },
  };
}

async function ensureTodayWar() {
  const { startTime, endTime } = getTodayWarSchedule();
  
  let war = await War.findOne({
    startTime: { $gte: startTime, $lt: endTime },
  });

  if (!war) {
    console.log("📅 Creating new war for today...");
    
    try {
      const contestants = await selectRandomContestants();
      
      war = await War.create({
        contestant1: contestants.contestant1,
        contestant2: contestants.contestant2,
        startTime,
        endTime,
        status: "scheduled",
      });
      
      console.log("✅ War created successfully:", war._id);
    } catch (error) {
      console.error("❌ Failed to create war:", error.message);
      throw error;
    }
  }

  const now = new Date();
  if (now >= war.startTime && now < war.endTime) {
    war.status = "active";
  } else if (now >= war.endTime) {
    war.status = "ended";
    if (war.winner === null) {
      war.calculateWinner();
    }
  } else {
    war.status = "scheduled";
  }
  
  await war.save();
  return war;
}

router.get("/", (req, res) => {
  res.json({
    message: "Wars API is alive ✅ Use /current or /history endpoints.",
  });
});

router.get("/current", async (req, res) => {
  try {
    const war = await ensureTodayWar();
    
    await war.populate([
      { path: "contestant1.userId", select: "name handle avatarUrl" },
      { path: "contestant2.userId", select: "name handle avatarUrl" },
      { path: "contestant1.vibeId", select: "text tags emojis" },
      { path: "contestant2.vibeId", select: "text tags emojis" },
    ]);

    const response = {
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
        status: war.status,
        votes: war.votes,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching current war:", error);
    res.status(500).json({ message: "Error fetching current war" });
  }
});

// ✅ FIXED: Vote endpoint with real-time status checking
router.post(
  "/:id/vote",
  auth,
  [
    param("id").isMongoId(),
    body("contestant").isInt().isIn([1, 2]),
  ],
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

      // ✅ FIX: Update war status based on current time BEFORE checking
      const now = new Date();
      if (now >= war.startTime && now < war.endTime) {
        war.status = "active";
      } else if (now >= war.endTime) {
        war.status = "ended";
        if (war.winner === null) {
          war.calculateWinner();
        }
      } else {
        war.status = "scheduled";
      }
      await war.save();

      if (war.status !== "active") {
        return res.status(400).json({ 
          message: war.status === "ended" 
            ? "This war has ended" 
            : "This war hasn't started yet" 
        });
      }

      if (war.hasUserVoted(userId)) {
        return res.status(400).json({ message: "You have already voted in this war" });
      }

      if (
        String(war.contestant1.userId) === String(userId) ||
        String(war.contestant2.userId) === String(userId)
      ) {
        return res.status(400).json({ message: "You cannot vote for yourself" });
      }

      war.votes.push({
        userId,
        contestantNumber: contestant,
      });

      if (contestant === 1) {
        war.contestant1.votes += 1;
      } else {
        war.contestant2.votes += 1;
      }

      await war.save();

      res.json({
        success: true,
        message: "Vote recorded",
        contestant,
      });
    } catch (error) {
      console.error("Error recording vote:", error);
      res.status(500).json({ message: "Error recording vote" });
    }
  }
);

router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const wars = await War.find({ status: "ended" })
      .sort({ endTime: -1 })
      .limit(limit)
      .populate([
        { path: "contestant1.userId", select: "name handle avatarUrl" },
        { path: "contestant2.userId", select: "name handle avatarUrl" },
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
              votes: war.contestant2.votes,
            },
          },
          totalVotes,
          endedAt: war.endTime,
        };
      }

      const isWinner1 = war.winner === 1;
      const winner = isWinner1 ? war.contestant1 : war.contestant2;
      const winnerVotes = isWinner1 ? war.contestant1.votes : war.contestant2.votes;

      return {
        _id: war._id,
        winner: {
          user: {
            name: winner.userId?.name || "Unknown",
            handle: winner.userId?.handle || "unknown",
            avatarUrl: winner.userId?.avatarUrl || "",
          },
          vibe: {
            votes: winnerVotes,
          },
        },
        loser: {
          vibe: {
            votes: isWinner1 ? war.contestant2.votes : war.contestant1.votes,
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
