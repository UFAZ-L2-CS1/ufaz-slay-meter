// backend/src/middleware/warScheduler.js
import cron from "node-cron";
import War from "../models/War.js";
import Vibe from "../models/Vibe.js";

/**
 * ✅ Select 2 random users with vibes
 */
async function selectRandomContestants() {
  const usersWithVibes = await Vibe.aggregate([
    { $match: { isVisible: true } },
    { $group: { _id: "$recipientId", vibeCount: { $sum: 1 } } },
    { $match: { vibeCount: { $gte: 1 } } },
    { $sample: { size: 2 } },
  ]);

  if (usersWithVibes.length < 2) {
    throw new Error("Not enough users with vibes");
  }

  const userId1 = usersWithVibes[0]._id;
  const userId2 = usersWithVibes[1]._id;

  // Get one random vibe for each
  const [vibe1] = await Vibe.find({ recipientId: userId1, isVisible: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .then((vibes) => vibes.sort(() => 0.5 - Math.random()).slice(0, 1));

  const [vibe2] = await Vibe.find({ recipientId: userId2, isVisible: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .then((vibes) => vibes.sort(() => 0.5 - Math.random()).slice(0, 1));

  if (!vibe1 || !vibe2) {
    throw new Error("Could not find vibes");
  }

  return {
    contestant1: { userId: userId1, vibeId: vibe1._id },
    contestant2: { userId: userId2, vibeId: vibe2._id },
  };
}

/**
 * ✅ Create today's war
 * War is ACTIVE the whole day (00:00–23:59), so voting is always allowed that day.
 */
async function createDailyWar() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // War schedule: whole day
    const startTime = new Date(today);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date(today);
    endTime.setHours(23, 59, 59, 999);

    console.log("📅 War Schedule (daily full-day):", {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      now: now.toISOString(),
    });

    // Check if today's war exists
    const existing = await War.findOne({
      startTime: { $gte: startTime, $lt: endTime },
    });

    if (existing) {
      console.log("⚠️ War already exists for today:", existing._id);
      return existing;
    }

    // Select contestants
    const contestants = await selectRandomContestants();

    // For a whole‑day war we can mark it active immediately
    const war = await War.create({
      contestant1: contestants.contestant1,
      contestant2: contestants.contestant2,
      startTime,
      endTime,
      status: "active",
    });

    console.log("✅ Daily war created:", war._id, "Status: active");
    return war;
  } catch (error) {
    console.error("❌ Failed to create daily war:", error.message);
    throw error;
  }
}

/**
 * ✅ End active wars that have passed their end time
 */
async function endExpiredWars() {
  try {
    const now = new Date();
    const expiredWars = await War.find({
      status: "active",
      endTime: { $lte: now },
    });

    for (const war of expiredWars) {
      war.status = "ended";
      war.calculateWinner();
      await war.save();
      console.log(`⏰ War ${war._id} ended. Winner: Contestant ${war.winner}`);
    }
  } catch (error) {
    console.error("❌ Error ending expired wars:", error);
  }
}

/**
 * ✅ Initialize war scheduler
 */
export function initWarScheduler() {
  console.log("🚀 War Scheduler initialized");

  // Create daily war shortly after midnight (00:05) in Asia/Baku
  cron.schedule(
    "5 0 * * *",
    async () => {
      console.log("⏰ Creating daily war (Asia/Baku timezone)...");
      try {
        await createDailyWar();
      } catch (error) {
        console.error("❌ Failed to create daily war:", error);
      }
    },
    {
      timezone: "Asia/Baku",
    }
  );

  // Check every minute to end expired wars
  cron.schedule("* * * * *", async () => {
    await endExpiredWars();
  });

  // Create today's war immediately if it doesn't exist (on server start)
  setTimeout(async () => {
    try {
      console.log("🔄 Checking for today's war on server start...");
      await createDailyWar();
    } catch (error) {
      console.error("❌ Initial war creation failed:", error);
    }
  }, 2000); // wait 2 seconds after server start

  console.log("✅ War scheduler tasks registered");
}
