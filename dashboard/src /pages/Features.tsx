import { CyberLayout } from "@/components/CyberLayout";
import { NeonCard, PageHeader } from "@/components/CyberComponents";
import { useFeatures, useToggleFeature } from "@/hooks/use-bot-api";
import { Switch } from "@/components/ui/switch"; // Need to style this or replace
import { Zap, Shield, MessageCircle, Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  const { data: features, isLoading } = useFeatures();
  const { mutate: toggle } = useToggleFeature();

  if (isLoading) return (
    <CyberLayout>
      <div className="flex items-center justify-center h-full text-neon-blue font-mono animate-pulse">LOADING MODULES...</div>
    </CyberLayout>
  );

  return (
    <CyberLayout>
      <PageHeader 
        title="Feature Modules" 
        subtitle="Toggle active bot subsystems and plugins." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features?.map((feature, idx) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <NeonCard 
              className={`h-full border-l-4 ${feature.isEnabled ? 'border-l-neon-green' : 'border-l-gray-700'}`}
              color={feature.isEnabled ? "green" : "blue"}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${feature.isEnabled ? 'bg-neon-green/10 text-neon-green shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'bg-gray-800 text-gray-500'}`}>
                  <Bot className="w-6 h-6" />
                </div>
                
                {/* Custom Switch using raw HTML/Tailwind for max control */}
                <button
                  onClick={() => toggle({ id: feature.id, isEnabled: !feature.isEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 focus:ring-offset-black ${
                    feature.isEnabled ? 'bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      feature.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <h3 className="font-cyber font-bold text-xl text-white mb-1">{feature.label}</h3>
              <div className="text-xs font-mono text-neon-blue mb-3">{feature.key}</div>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </NeonCard>
          </motion.div>
        ))}
      </div>
    </CyberLayout>
  );
}
