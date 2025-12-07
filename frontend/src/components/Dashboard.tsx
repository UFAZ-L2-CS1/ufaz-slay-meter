import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { SendVibe } from "@/components/SendVibe";
import { VibeCard } from "@/components/VibeCard";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Sparkles, Users, Zap } from "lucide-react";

const sampleVibes = [
  {
    id: "1",
    author: { name: "Sarah Chen", username: "sarahc", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    content: "Just finished a 30-day meditation streak! The clarity and peace I feel is incredible. Highly recommend starting your mindfulness journey 🧘‍♀️",
    emoji: "✨",
    likes: 234,
    comments: 45,
    timestamp: "2h",
  },
  {
    id: "2",
    author: { name: "Marcus Johnson", username: "mjohnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    content: "Spreading good vibes today! Remember: your energy introduces you before you even speak 💫",
    emoji: "💖",
    likes: 567,
    comments: 89,
    timestamp: "4h",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
  },
  {
    id: "3",
    author: { name: "Luna Park", username: "lunapark", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    content: "Coffee in hand, sunshine on my face, and endless possibilities ahead. This is what mornings should feel like ☀️",
    emoji: "🔥",
    likes: 189,
    comments: 23,
    timestamp: "6h",
  },
];

const trendingTopics = [
  { tag: "#MorningVibes", count: "12.5k" },
  { tag: "#Mindfulness", count: "8.3k" },
  { tag: "#GoodEnergy", count: "6.1k" },
  { tag: "#DailyGratitude", count: "4.8k" },
];

const suggestedUsers = [
  { name: "Alex Rivera", username: "alexr", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
  { name: "Maya Singh", username: "mayasingh", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
];

export function Dashboard() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      
      <main className="container pt-24 pb-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Feed */}
          <div className="space-y-6">
            <SendVibe />
            
            <div className="space-y-4">
              {sampleVibes.map((vibe) => (
                <VibeCard key={vibe.id} {...vibe} />
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {/* Stats Card */}
            <Card className="glass border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                  Your Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-gradient">127</p>
                    <p className="text-xs text-muted-foreground">Vibes Sent</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-gradient">1.2k</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-gradient">14</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-gradient">#42</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending */}
            <Card className="glass border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Now
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {topic.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">{topic.count} vibes</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card className="glass border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  Who to Follow
                </h3>
                <div className="space-y-3">
                  {suggestedUsers.map((user, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                      <Avatar className="h-10 w-10 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
