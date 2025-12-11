// backend/src/middleware/warScheduler.js
import cron from "node-cron";
import War from "../models/War.js";
import User from "../models/User.js";
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
 */
async function createDailyWar() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // War schedule: 9:30 AM - 10:30 AM
    const startTime = new Date(today);
    startTime.setHours(2, 20, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(2, 20, 0, 0);

    // Check if today's war exists
    const existing = await War.findOne({
      startTime: { $gte: startTime, $lt: endTime },
    });

    if (existing) {
      console.log("⚠️ War already exists for today");
      return existing;
    }

    // Select contestants
    const contestants = await selectRandomContestants();

    // Create war
    const war = await War.create({
      contestant1: contestants.contestant1,
      contestant2: contestants.contestant2,
      startTime,
      endTime,
      status: "active",
    });

    console.log("✅ Daily war created:", war._id);
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

  // 1. Create daily war at 9:00 AM (30 mins before start)
cron.schedule("20 2 * * *", async () => {
  console.log("⏰ Creating daily war (Asia/Baku)...");
  try {
    await createDailyWar();
  } catch (error) {
    console.error("❌ Failed to create daily war:", error);
  }
}, {
  timezone: "Asia/Baku" // 🔥 vacibdir
});


  // 2. Check every minute to end expired wars
  cron.schedule("* * * * *", async () => {
    await endExpiredWars();
  });

  // 3. Create today's war immediately if it doesn't exist (on server start)
  setTimeout(async () => {
    try {
      await createDailyWar();
    } catch (error) {
      console.error("❌ Initial war creation failed:", error);
    }
  }, 2000); // wait 2 seconds after server start

  console.log("✅ War scheduler tasks registered");
}
