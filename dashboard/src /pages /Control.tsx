import { CyberLayout } from "@/components/CyberLayout";
import { NeonCard, CyberButton, PageHeader } from "@/components/CyberComponents";
import { useBotControl, useBotStats } from "@/hooks/use-bot-api";
import { Power, RefreshCw, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ControlPage() {
  const { mutate, isPending } = useBotControl();
  const { data: stats } = useBotStats();
  const { toast } = useToast();

  const handleAction = (action: 'start' | 'stop' | 'restart') => {
    mutate({ action }, {
      onSuccess: (data) => {
        toast({ title: "Command Executed", description: data.message });
      },
      onError: (err) => {
        toast({ title: "Command Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const isOnline = stats?.status === 'online';

  return (
    <CyberLayout>
      <PageHeader 
        title="Command Center" 
        subtitle="Execute high-level administrative commands." 
      />

      <div className="max-w-3xl mx-auto">
        <NeonCard color="blue" className="p-10 border-2 border-neon-blue/20">
          <div className="text-center mb-10">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 border-4 ${isOnline ? 'border-neon-green bg-neon-green/10 shadow-[0_0_50px_rgba(57,255,20,0.3)]' : 'border-red-500 bg-red-500/10 shadow-[0_0_50px_rgba(255,0,0,0.3)]'} transition-all duration-500`}>
              <Power className={`w-12 h-12 ${isOnline ? 'text-neon-green' : 'text-red-500'}`} />
            </div>
            <h2 className="text-2xl font-cyber font-bold text-white mb-2">CURRENT STATE: {stats?.status?.toUpperCase()}</h2>
            <p className="text-gray-400 font-mono text-sm max-w-md mx-auto">
              System commands are logged. Use caution when restarting active services during peak hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CyberButton 
              variant="primary" 
              className="h-20 text-lg border-neon-green text-neon-green hover:bg-neon-green/20"
              onClick={() => handleAction('start')}
              disabled={isPending || isOnline}
            >
              <div className="flex flex-col items-center gap-1">
                <Power className="w-6 h-6" />
                <span>INITIATE</span>
              </div>
            </CyberButton>

            <CyberButton 
              variant="outline" 
              className="h-20 text-lg"
              onClick={() => handleAction('restart')}
              disabled={isPending}
            >
               <div className="flex flex-col items-center gap-1">
                <RefreshCw className={`w-6 h-6 ${isPending ? 'animate-spin' : ''}`} />
                <span>REBOOT</span>
              </div>
            </CyberButton>

            <CyberButton 
              variant="danger" 
              className="h-20 text-lg"
              onClick={() => handleAction('stop')}
              disabled={isPending || !isOnline}
            >
               <div className="flex flex-col items-center gap-1">
                <Square className="w-6 h-6 fill-current" />
                <span>TERMINATE</span>
              </div>
            </CyberButton>
          </div>
        </NeonCard>
      </div>
    </CyberLayout>
  );
}
