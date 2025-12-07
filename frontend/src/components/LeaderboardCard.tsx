import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardCardProps {
  rank: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  vibes: number;
  streak: number;
  trend: "up" | "down" | "same";
}

export function LeaderboardCard({ rank, user, vibes, streak, trend }: LeaderboardCardProps) {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const isTopThree = rank <= 3;

  return (
    <Card
      className={cn(
        "glass border-border/50 overflow-hidden transition-all duration-500 hover:glow-sm animate-fade-in",
        isTopThree && "ring-2 ring-primary/20"
      )}
      style={{ animationDelay: `${rank * 50}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50">
            {getRankIcon()}
          </div>
          
          <Avatar className={cn(
            "h-12 w-12 ring-2",
            isTopThree ? "ring-primary/50" : "ring-border/50"
          )}>
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{user.name}</span>
              {isTopThree && (
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">@{user.username}</span>
          </div>
          
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-lg font-bold text-gradient">{vibes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">vibes</p>
            </div>
            
            <Badge variant="outline" className="gap-1 bg-muted/30">
              🔥 {streak} day
            </Badge>
            
            {trend === "up" && (
              <TrendingUp className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
