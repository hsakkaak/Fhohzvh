import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Terminal, 
  Settings, 
  Activity, 
  Cpu, 
  Users, 
  FileCode, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function CyberLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const [location] = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Bangladesh Time (UTC+6)
  const bdTime = time.toLocaleTimeString("en-US", { 
    timeZone: "Asia/Dhaka",
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity, color: "text-neon-green" },
    { href: "/control", label: "Control Panel", icon: Cpu, color: "text-neon-blue" },
    { href: "/features", label: "Features", icon: Settings, color: "text-neon-pink" },
    { href: "/groups", label: "Groups", icon: Users, color: "text-neon-purple" },
    { href: "/logs", label: "System Logs", icon: Terminal, color: "text-neon-yellow" },
    { href: "/files", label: "File Editor", icon: FileCode, color: "text-white" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-dark))] text-white font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-neon-blue animate-pulse" />
          <span className="font-cyber font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            CYBER<span className="text-white">BOT</span>
          </span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-6 hidden lg:flex items-center gap-3 border-b border-white/10 bg-black/40">
            <Shield className="w-10 h-10 text-neon-blue drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
            <div>
              <h1 className="font-cyber font-bold text-2xl tracking-wider text-white">
                CYBER<span className="text-neon-blue">BOT</span>
              </h1>
              <div className="text-xs text-gray-500 font-mono tracking-widest">SYSTEM v2.0.77</div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-white/5 bg-white/5">
            <div className="text-sm text-gray-400 mb-1 font-mono">OPERATOR</div>
            <div className="font-bold text-neon-green tracking-wide truncate">{user?.username || "UNKNOWN"}</div>
            {user?.isAdmin && <div className="text-xs text-neon-purple mt-1">[ADMIN_ACCESS_GRANTED]</div>}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group mb-1",
                      isActive 
                        ? "bg-white/10 border border-white/10 shadow-[0_0_15px_rgba(0,255,255,0.15)]" 
                        : "hover:bg-white/5 hover:translate-x-1"
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className={cn("w-5 h-5 transition-colors", isActive ? item.color : "text-gray-400 group-hover:text-white")} />
                    <span className={cn("font-medium tracking-wide", isActive ? "text-white" : "text-gray-400 group-hover:text-white")}>
                      {item.label}
                    </span>
                    {isActive && <div className={cn("ml-auto w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]", item.color.replace('text-', 'bg-'))} />}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-white/10 bg-black/40">
             <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                 <Clock className="w-3 h-3 text-neon-blue" />
                 <span>BD: {bdTime}</span>
               </div>
             </div>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold tracking-wider">DISCONNECT</span>
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {/* Top subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed" />
          <div className="relative z-10 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
