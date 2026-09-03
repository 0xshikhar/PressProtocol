"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, Bell, BookMarked, TrendingUp, FileText, Home, BarChart3, Settings, HelpCircle, User, Globe, UploadCloud, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (pathname === "/" || pathname?.startsWith("/embed")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { href: "/explore", label: "Discover", icon: Search },
    { href: "/bookmarks", label: "Reading List", icon: BookMarked },
    { href: "/import", label: "Import", icon: UploadCloud },
    { href: "/write", label: "Publish", icon: FileText },
    { href: "/explorer", label: "Explorer", icon: Globe },
    { href: "/developers", label: "Developers", icon: Terminal },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050508]/85 backdrop-blur-2xl text-white shadow-2xl transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/15 group-hover:border-cyan-400/50 transition-colors">
            <span className="text-cyan-400 font-mono text-sm font-bold">¶</span>
            <div className="absolute -inset-0.5 rounded-lg bg-cyan-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display tracking-tight text-xl text-white font-medium group-hover:text-cyan-300 transition-colors">
            PressProtocol
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-1.5 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-xs font-mono tracking-wide transition-all h-9 px-3 rounded-lg border",
                    isActive
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-sm shadow-cyan-500/10"
                      : "border-transparent text-white/70 hover:text-white hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-cyan-400" : "text-white/60")} />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center space-x-2 md:flex">
          {/* Profile / Reading Vault */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/profile")}
            className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all"
            title="Profile"
          >
            <User className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
            className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 relative transition-all"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Auth */}
          <AuthButton />
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Search */}
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/5">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto bg-[#050508]/95 backdrop-blur-2xl border-b border-white/10 text-white">
              <SheetHeader>
                <SheetTitle className="text-white font-mono text-xs uppercase tracking-wider">Search Content</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSearch} className="mt-4">
                <Input
                  type="text"
                  placeholder="Search decentralized publications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400"
                  autoFocus
                />
              </form>
            </SheetContent>
          </Sheet>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/5">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[290px] bg-[#050508]/95 backdrop-blur-3xl border-l border-white/10 text-white">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/15">
                    <span className="text-cyan-400 font-mono text-sm font-bold">¶</span>
                  </div>
                  <span className="font-display text-lg text-white">PressProtocol</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 pb-1">
                  Protocol Shell
                </div>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  
                  return (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 text-xs font-mono",
                          isActive
                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", isActive ? "text-cyan-400" : "text-white/60")} />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
                
                <div className="my-3 border-t border-white/10" />
                
                <Link href="/bookmarks">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-xs font-mono text-white/70 hover:text-white hover:bg-white/5">
                    <BookMarked className="h-4 w-4 text-emerald-400" />
                    Reading List
                  </Button>
                </Link>
                
                <Link href="/settings">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-xs font-mono text-white/70 hover:text-white hover:bg-white/5">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
                
                <div className="my-3 border-t border-white/10" />
                
                <div className="pt-1">
                  <AuthButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
