import { CyberLayout } from "@/components/CyberLayout";
import { NeonCard, PageHeader } from "@/components/CyberComponents";
import { useBotStats } from "@/hooks/use-bot-api";
import { 
  Activity, 
  Cpu, 
  Database, 
  MessageSquare, 
  Clock, 
  PlayCircle 
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useBotStats();

  const statusColors = {
    online: "text-neon-green",
    offline: "text-red-500",
    maintenance: "text-neon-yellow",
    restarting: "text-neon-blue",
  };

  return (
    <CyberLayout>
      <PageHeader 
        title="System Overview" 
        subtitle="Real-time performance metrics and bot status monitoring." 
      />

      {/* Video Cover */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-10 relative border border-white/10 group shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-10" />
        {/* Using a tech/cyberpunk abstract video background - muted autoplay */}
        {/* Descriptive comment: Abstract digital network connections with glowing nodes */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 transform group-hover:scale-105"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-blue-circuit-board-97-large.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute bottom-6 left-6 z-20">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${stats?.status === 'online' ? 'bg-neon-green shadow-[0_0_10px_#39ff14]' : 'bg-red-500'} animate-pulse`} />
            <span className="font-cyber text-lg tracking-widest text-white">SYSTEM STATUS</span>
          </div>
          <h2 className={`text-3xl font-bold uppercase tracking-wider ${stats ? statusColors[stats.status] : 'text-gray-500'}`}>
            {stats?.status || "CONNECTING..."}
          </h2>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NeonCard 
          title="Uptime" 
          icon={<Clock className="w-5 h-5" />} 
          color="green" 
          className="bg-gradient-to-br from-[#0a0a0b] to-green-900/10"
        >
          <div className="text-2xl font-mono font-bold text-white">
            {isLoading ? "..." : stats?.uptime}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-mono">Continuous Operation</div>
        </NeonCard>

        <NeonCard 
          title="Active Threads" 
          icon={<Activity className="w-5 h-5" />} 
          color="blue"
          className="bg-gradient-to-br from-[#0a0a0b] to-blue-900/10"
        >
          <div className="text-4xl font-mono font-bold text-white">
            {isLoading ? "..." : stats?.activeThreads}
          </div>
          <div className="w-full bg-gray-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-neon-blue h-full rounded-full" style={{ width: `${(stats?.activeThreads || 0) * 5}%` }} />
          </div>
        </NeonCard>

        <NeonCard 
          title="Messages" 
          icon={<MessageSquare className="w-5 h-5" />} 
          color="pink"
          className="bg-gradient-to-br from-[#0a0a0b] to-pink-900/10"
        >
          <div className="text-4xl font-mono font-bold text-white">
            {isLoading ? "..." : stats?.totalMessages.toLocaleString()}
          </div>
          <div className="text-xs text-neon-pink mt-2 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3" /> +12% from last hour
          </div>
        </NeonCard>

        <NeonCard 
          title="System Load" 
          icon={<Cpu className="w-5 h-5" />} 
          color="purple"
          className="bg-gradient-to-br from-[#0a0a0b] to-purple-900/10"
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>CPU</span>
                <span>{stats?.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-neon-purple h-full rounded-full transition-all duration-500" style={{ width: `${stats?.cpuUsage || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>MEM</span>
                <span>{stats?.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-neon-yellow h-full rounded-full transition-all duration-500" style={{ width: `${stats?.memoryUsage || 0}%` }} />
              </div>
            </div>
          </div>
        </NeonCard>
      </div>
    </CyberLayout>
  );
}
