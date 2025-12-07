import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Heart, Zap, Users, Globe } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Glow Effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-chart-2/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Share your energy with the world
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Spread the</span>
              <br />
              <span className="text-gradient">Good Vibes ✨</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with positive people, share your daily moments, and create a ripple effect of positivity across the globe.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-gradient-primary hover:opacity-90 glow gap-2 text-lg px-8 h-14"
              >
                Start Vibing
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 text-lg px-8 h-14 bg-muted/30 border-border/50 hover:bg-muted/50"
              >
                <Globe className="h-5 w-5" />
                Explore Vibes
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20">
            {[
              { icon: Users, label: "Active Vibers", value: "50K+" },
              { icon: Heart, label: "Vibes Shared", value: "2M+" },
              { icon: Zap, label: "Daily Streaks", value: "100K+" },
              { icon: Globe, label: "Countries", value: "120+" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="glass rounded-2xl p-6 text-center hover:glow-sm transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient">VibeApp</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for people who want to make a positive impact, one vibe at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                emoji: "✨",
                title: "Express Yourself",
                description: "Share your mood, thoughts, and energy with beautiful vibe cards that capture your essence."
              },
              {
                emoji: "🏆",
                title: "Climb the Ranks",
                description: "Build your streak, earn badges, and compete on the leaderboard to become the ultimate vibe master."
              },
              {
                emoji: "🌍",
                title: "Global Community",
                description: "Connect with like-minded people from around the world who spread positivity daily."
              },
            ].map((feature, i) => (
              <div 
                key={i}
                className="glass rounded-2xl p-6 hover:glow-sm transition-all duration-500 group animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-4xl mb-4 group-hover:animate-float">{feature.emoji}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="glass rounded-3xl p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Start Your Vibe Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of people spreading positivity every day. Your vibe matters!
              </p>
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-primary hover:opacity-90 glow gap-2 text-lg px-8 h-14"
              >
                Get Started Free
                <Sparkles className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-gradient">VibeApp</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 VibeApp. Spreading good vibes worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
