import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/hooks/use-bot-api";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Lock, User, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CyberButton } from "@/components/CyberComponents";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { mutate, isPending } = useLogin();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Error", description: "Username and password are required", variant: "destructive" });
      return;
    }

    mutate({ username, password }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({ title: "Access Granted", description: `Welcome back, ${data.user.username}.` });
        setLocation("/");
      },
      onError: (err) => {
        toast({ title: "Access Denied", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
      {/* Background Grid & Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black/50 border border-neon-blue/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] mb-6 animate-pulse">
            <Shield className="w-10 h-10 text-neon-blue" />
          </div>
          <h1 className="text-4xl font-cyber font-bold text-white tracking-widest mb-2">
            CYBER<span className="text-neon-blue">BOT</span>
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em]">Restricted Access Area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Identity</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all placeholder:text-gray-700 font-mono"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple focus:outline-none transition-all placeholder:text-gray-700 font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <CyberButton 
            type="submit" 
            className="w-full mt-4" 
            isLoading={isPending}
            variant="primary"
          >
            {isPending ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
          </CyberButton>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600 font-mono flex items-center justify-center gap-2">
            <Terminal className="w-3 h-3" />
            SECURE CONNECTION ESTABLISHED
          </p>
        </div>
      </div>
    </div>
  );
}
