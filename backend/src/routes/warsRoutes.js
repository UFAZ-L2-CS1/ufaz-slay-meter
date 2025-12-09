// backend/src/routes/warsRoutes.js
import { Router } from "express";

const router = Router();

// Get current vibe war
router.get("/current", async (req, res) => {
  try {
    // Mock war for demo
    const mockWar = {
      _id: 'current-war',
      contestant1: {
        user: { name: 'Amazing Student', handle: 'slayer1', avatarUrl: '' },
        vibe: {
          text: 'You have incredible energy and always light up the room!',
          tags: ['energetic', 'inspiring', 'amazing'],
          votes: Math.floor(Math.random() * 100)
        }
      },
      contestant2: {
        user: { name: 'Creative Genius', handle: 'slayer2', avatarUrl: '' },
        vibe: {
          text: 'Your creativity is absolutely unmatched!',
          tags: ['creative', 'talented', 'brilliant'],
          votes: Math.floor(Math.random() * 100)
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
router.post("/:id/vote", async (req, res) => {
  try {
    const { contestant } = req.body;
    // Mock response
    res.json({ success: true, message: 'Vote recorded', contestant });
  } catch (error) {
    console.error("Error recording vote:", error);
    res.status(500).json({ message: "Error recording vote" });
  }
});

// Get war history
router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Mock history data
    const history = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      _id: `war-${i + 1}`,
      winner: {
        user: { name: `Winner ${i + 1}`, handle: `winner${i + 1}` },
        vibe: {
          text: 'This was an amazing vibe!',
          votes: Math.floor(Math.random() * 200) + 100
        }
      },
      loser: {
        user: { name: `Runner-up ${i + 1}`, handle: `runner${i + 1}` },
        vibe: {
          text: 'Also a great vibe!',
          votes: Math.floor(Math.random() * 150) + 50
        }
      },
      endedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString()
    }));
    
    res.json({ wars: history });
  } catch (error) {
    console.error("Error fetching war history:", error);
    res.status(500).json({ message: "Error fetching war history" });
  }
});

export default router;
