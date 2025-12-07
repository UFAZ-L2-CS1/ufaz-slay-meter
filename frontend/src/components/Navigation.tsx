import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Compass, Trophy, User, Settings, Menu, Sparkles, LogIn } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Explore", href: "/explore", icon: <Compass className="h-5 w-5" /> },
  { label: "Leaderboard", href: "/leaderboard", icon: <Trophy className="h-5 w-5" /> },
  { label: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
];

interface NavigationProps {
  onAuthClick?: () => void;
}

export function Navigation({ onAuthClick }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-sm group-hover:glow transition-all duration-300">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">VibeApp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground glow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Button */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onAuthClick} className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <Button onClick={onAuthClick} className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity glow-sm">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass w-72">
            <div className="flex flex-col gap-4 pt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <Button onClick={() => { onAuthClick?.(); setOpen(false); }} className="w-full bg-gradient-primary">
                  Get Started
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
