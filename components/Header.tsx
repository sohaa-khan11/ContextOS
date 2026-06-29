"use client";
import { Command, Settings, LayoutDashboard, Database, Activity, GitGraph } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();

  return (
    <div className="w-[260px] flex-shrink-0 h-screen sticky top-0 bg-[#140b0d] border-r border-[#2c1a1e] flex flex-col hidden md:flex">
      
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(255,77,94,0.4)]">
          <Command className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight">ContextOS</h1>
          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mt-0.5">AI-Native Memory</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <Link href="/projects" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === '/projects' ? 'bg-[#261619] text-white glow-border' : 'text-muted-foreground hover:text-white hover:bg-[#1a0e11]'}`}>
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-[#1a0e11] transition-colors">
          <Database className="w-4 h-4" />
          Memories
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-[#1a0e11] transition-colors">
          <Activity className="w-4 h-4" />
          Timeline
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-[#1a0e11] transition-colors">
          <GitGraph className="w-4 h-4" />
          Graph
        </Link>
        
        <div className="pt-8">
          <Link href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-[#1a0e11] transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </nav>

      {/* Pro Banner */}
      <div className="px-6 py-4">
        <div className="bg-[#180e10] border border-[#2c1a1e] rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Command className="w-3.5 h-3.5 text-primary" />
            <span className="text-white text-sm font-medium">ContextOS Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Unlimited memories</p>
          <Button variant="outline" size="sm" className="w-full h-8 text-xs rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors">
            Upgrade
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-t border-[#2c1a1e] flex items-center gap-3">
        <Avatar className="w-9 h-9 border border-[#2c1a1e]">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>SK</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <h4 className="text-sm font-medium text-white truncate">Soha Khan</h4>
          <p className="text-xs text-muted-foreground truncate">soha@example.com</p>
        </div>
      </div>
    </div>
  );
}
