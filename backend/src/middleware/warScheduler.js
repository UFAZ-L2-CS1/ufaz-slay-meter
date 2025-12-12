// backend/src/middleware/warScheduler.js
import cron from "node-cron";
import War from "../models/War.js";
import Vibe from "../models/Vibe.js";

/**
 * ✅ Select 2 DIFFERENT random users with vibes
 */
async function selectRandomContestants() {
  // Get all users with visible vibes
  const usersWithVibes = await Vibe.aggregate([
    { $match: { isVisible: true } },
    { $group: { _id: "$recipientId", vibeCount: { $sum: 1 } } },
    { $match: { vibeCount: { $gte: 1 } } },
  ]);

  if (usersWithVibes.length < 2) {
    throw new Error("Not enough users with vibes");
  }

  console.log(`📊 Found ${usersWithVibes.length} users with vibes`);

  // Shuffle the array properly using Fisher-Yates algorithm
  for (let i = usersWithVibes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [usersWithVibes[i], usersWithVibes[j]] = [usersWithVibes[j], usersWithVibes[i]];
  }
  
  // Take first 2 users after shuffle
  const userId1 = usersWithVibes[0]._id;
  const userId2 = usersWithVibes[1]._id;

  // Safety check - make sure they're different
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
    throw new Error("Could not find vibes");
  }

  // Pick random vibe from each user's vibes
  const vibe1 = vibes1[Math.floor(Math.random() * vibes1.length)];
  const vibe2 = vibes2[Math.floor(Math.random() * vibes2.length)];

  console.log("✅ Selected contestants:", {
    user1: userId1.toString(),
    user2: userId2.toString(),
    vibe1Count: vibes1.length,
    vibe2Count: vibes2.length,
  });

  return {
    contestant1: { userId: userId1, vibeId: vibe1._id },
    contestant2: { userId: userId2, vibeId: vibe2._id },
  };
}

/**
 * ✅ Create today's war
 * Starts at 11:10 AM (Asia/Baku) and runs until the end of the day
 */
async function createDailyWar() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start at 11:10:00 local day
    const startTime = new Date(today);
    startTime.setHours(11, 10, 0, 0);

    // End at end of the same day
    const endTime = new Date(today);
    endTime.setHours(23, 59, 59, 999);

    console.log("📅 War Schedule:", {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      now: now.toISOString(),
    });

    // Check if today's war already exists
    const existing = await War.findOne({
      startTime: { $gte: startTime, $lte: endTime },
    });

    if (existing) {
      console.log("⚠️ War already exists for today:", existing._id);
      
      // Update status if needed
      if (now >= startTime && now < endTime && existing.status === "scheduled") {
        existing.status = "active";
        await existing.save();
        console.log("✅ Updated war status to active");
      }
      
      return existing;
    }

    // Select contestants
    console.log("🎲 Selecting random contestants...");
    const contestants = await selectRandomContestants();

    // Determine initial status
    let initialStatus = "scheduled";
    if (now >= startTime && now < endTime) {
      initialStatus = "active";
    } else if (now >= endTime) {
      initialStatus = "ended";
    }

    const war = await War.create({
      contestant1: contestants.contestant1,
      contestant2: contestants.contestant2,
      startTime,
      endTime,
      status: initialStatus,
    });

    console.log("✅ Daily war created:", war._id, "Status:", war.status);
    return war;
  } catch (error) {
    console.error("❌ Failed to create daily war:", error.message);
    throw error;
  }
}

/**
 * ✅ Activate scheduled wars that should be active now
 */
async function activateScheduledWars() {
  try {
    const now = new Date();
    const scheduledWars = await War.find({
      status: "scheduled",
      startTime: { $lte: now },
      endTime: { $gt: now },
    });

    for (const war of scheduledWars) {
      war.status = "active";
      await war.save();
      console.log(`✅ Activated war ${war._id}`);
    }
  } catch (error) {
    console.error("❌ Error activating scheduled wars:", error);
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
      console.log(`⏰ War ${war._id} ended. Winner: Contestant ${war.winner || "TIE"}`);
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

  // Create daily war at 11:10 AM in Asia/Baku
  cron.schedule(
    "10 11 * * *",
    async () => {
      console.log("⏰ [CRON] Creating daily war at 11:10 AM...");
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

  // Check every minute to:
  // 1. Activate scheduled wars that should be active
  // 2. End expired wars
  cron.schedule("* * * * *", async () => {
    await activateScheduledWars();
    await endExpiredWars();
  });

  // Create today's war immediately on server start (if doesn't exist)
  setTimeout(async () => {
    try {
      console.log("🔄 Checking for today's war on server start...");
      await createDailyWar();
    } catch (error) {
      console.error("❌ Initial war creation failed:", error);
    }
  }, 2000);

  console.log("✅ War scheduler tasks registered");
  console.log("   - Daily war creation: 11:10 AM Asia/Baku");
  console.log("   - Status checks: Every minute");
}