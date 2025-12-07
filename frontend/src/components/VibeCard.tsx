import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface VibeCardProps {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  emoji: string;
  likes: number;
  comments: number;
  timestamp: string;
  image?: string;
}

export function VibeCard({ author, content, emoji, likes, comments, timestamp, image }: VibeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <Card className="glass border-border/50 overflow-hidden group hover:glow-sm transition-all duration-500 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={author.avatar} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{author.name}</span>
              <span className="text-muted-foreground text-sm">@{author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timestamp}</span>
              <span className="text-xl ml-auto">{emoji}</span>
            </div>
            
            <p className="mt-2 text-foreground leading-relaxed">{content}</p>
            
            {image && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img src={image} alt="Vibe" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "gap-2 transition-all duration-300",
              isLiked ? "text-accent-foreground" : "text-muted-foreground hover:text-accent-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            {likeCount}
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <MessageCircle className="h-4 w-4" />
            {comments}
          </Button>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSaved(!isSaved)}
          className={cn(
            "transition-all duration-300",
            isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
        </Button>
      </CardFooter>
    </Card>
  );
}
