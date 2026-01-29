import { CyberLayout } from "@/components/CyberLayout";
import { PageHeader, CyberButton } from "@/components/CyberComponents";
import { useLogs, useClearLogs } from "@/hooks/use-bot-api";
import { Terminal, Trash2, Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { useRef, useEffect } from "react";

export default function LogsPage() {
  const { data: logs, isLoading } = useLogs();
  const { mutate: clearLogs, isPending } = useClearLogs();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logs && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const levelIcons = {
    info: <Info className="w-4 h-4 text-blue-400" />,
    warn: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    error: <AlertTriangle className="w-4 h-4 text-red-400" />,
    success: <CheckCircle className="w-4 h-4 text-green-400" />,
  };

  const levelColors = {
    info: "text-blue-400",
    warn: "text-yellow-400",
    error: "text-red-400",
    success: "text-green-400",
  };

  return (
    <CyberLayout>
      <div className="flex items-center justify-between mb-6">
        <PageHeader 
          title="System Logs" 
          subtitle="Real-time kernel output and event stream." 
        />
        <CyberButton 
          variant="danger" 
          onClick={() => clearLogs()} 
          disabled={isPending || !logs?.length}
          className="text-sm h-10 px-4"
        >
          <Trash2 className="w-4 h-4 mr-2" /> CLEAR
        </CyberButton>
      </div>

      <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-250px)]">
        {/* Terminal Header */}
        <div className="bg-[#111] px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="text-xs font-mono text-gray-500">bash --root</div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-white/20">
          {isLoading ? (
            <div className="text-neon-green animate-pulse">Initializing log stream...</div>
          ) : logs?.length === 0 ? (
            <div className="text-gray-600 italic">No logs available. System clean.</div>
          ) : (
            logs?.map((log) => (
              <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors group">
                <span className="text-gray-600 w-24 flex-shrink-0 text-xs pt-0.5">
                  {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                </span>
                <span className={`uppercase font-bold text-xs w-16 pt-0.5 ${levelColors[log.level as keyof typeof levelColors]}`}>
                  [{log.level}]
                </span>
                <span className="text-gray-300 break-all group-hover:text-white transition-colors">
                  <span className="text-neon-green mr-2">$</span>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </CyberLayout>
  );
}
