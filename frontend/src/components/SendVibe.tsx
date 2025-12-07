import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Image, Smile, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const emojiOptions = ["✨", "💖", "🔥", "🌈", "⚡", "🎉", "💫", "🌸"];

export function SendVibe() {
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("✨");

  const handleSend = () => {
    if (!content.trim()) return;
    
    toast({
      title: "Vibe sent! ✨",
      description: "Your vibe has been shared with the world.",
    });
    setContent("");
  };

  return (
    <Card className="glass border-border/50 overflow-hidden group hover:glow-sm transition-all duration-500">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's your vibe today? ✨"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] bg-muted/30 border-border/50 resize-none focus-visible:ring-primary/50"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Image className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/30">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-lg p-1 rounded-full transition-all ${
                        selectedEmoji === emoji ? "bg-primary/20 scale-110" : "hover:bg-muted/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleSend}
                disabled={!content.trim()}
                className="bg-gradient-primary hover:opacity-90 glow-sm gap-2"
              >
                <Send className="h-4 w-4" />
                Send Vibe
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
