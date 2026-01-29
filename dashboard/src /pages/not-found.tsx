import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Glitch Effect Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 text-center">
        <div className="inline-block mb-6 p-6 rounded-full bg-red-500/10 border border-red-500/50 shadow-[0_0_50px_rgba(255,0,0,0.3)] animate-pulse">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-7xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2">404</h1>
        <h2 className="text-2xl font-cyber text-red-500 tracking-[0.2em] mb-8">SYSTEM_ERROR_NOT_FOUND</h2>
        
        <p className="text-gray-400 font-mono text-sm mb-8 max-w-md mx-auto">
          The requested resource path does not exist in the current memory sector. Connection terminated.
        </p>

        <Link href="/">
          <button className="px-8 py-4 bg-white text-black font-cyber font-bold tracking-wider hover:bg-neon-blue hover:text-white hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300 clip-path-polygon">
            RETURN TO DASHBOARD
          </button>
        </Link>
      </div>
    </div>
  );
}
