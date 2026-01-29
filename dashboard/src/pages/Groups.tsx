import { CyberLayout } from "@/components/CyberLayout";
import { NeonCard, PageHeader } from "@/components/CyberComponents";
import { useGroups } from "@/hooks/use-bot-api";
import { Users, Hash, ShieldCheck, Activity } from "lucide-react";

export default function GroupsPage() {
  const { data: groups, isLoading } = useGroups();

  return (
    <CyberLayout>
      <PageHeader 
        title="Active Groups" 
        subtitle="Manage bot presence in discussion channels." 
      />

      <NeonCard className="p-0 overflow-hidden border-neon-purple/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-cyber text-neon-purple uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Group Name</th>
                <th className="px-6 py-4 text-center">Members</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-mono animate-pulse">
                    SCANNING NETWORK...
                  </td>
                </tr>
              ) : groups?.map((group) => (
                <tr key={group.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center text-neon-purple group-hover:shadow-[0_0_10px_rgba(188,19,254,0.3)] transition-all">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-neon-purple transition-colors">{group.name}</div>
                        <div className="text-xs text-gray-500 font-mono">ID: {group.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 font-mono text-sm text-gray-300">
                      <Users className="w-3 h-3" />
                      {group.memberCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      group.status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${group.status === 'active' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                      {group.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeonCard>
    </CyberLayout>
  );
}
