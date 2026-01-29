import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  color?: "green" | "blue" | "pink" | "purple" | "yellow";
  title?: string;
  icon?: ReactNode;
}

export function NeonCard({ children, className, color = "blue", title, icon }: NeonCardProps) {
  const borderColor = `border-neon-${color}`;
  const shadowColor = `shadow-neon-${color}`;
  const textColor = `text-neon-${color}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "bg-[#0a0a0b]/80 backdrop-blur-md border rounded-xl p-6 relative overflow-hidden group hover:bg-[#111113]/90 transition-colors",
        borderColor,
        "border-opacity-30 hover:border-opacity-100",
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur-md pointer-events-none bg-current",
        textColor.replace('text-', 'bg-')
      )} />

      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
          {icon && <span className={cn(textColor, "drop-shadow-[0_0_8px_currentColor]")}>{icon}</span>}
          {title && <h3 className="font-cyber font-bold text-lg tracking-wide uppercase text-gray-200">{title}</h3>}
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  isLoading?: boolean;
}

export function CyberButton({ children, className, variant = "primary", isLoading, ...props }: CyberButtonProps) {
  const variants = {
    primary: "bg-neon-blue/10 text-neon-blue border-neon-blue/50 hover:bg-neon-blue/20 hover:border-neon-blue hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]",
    secondary: "bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40",
    danger: "bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20 hover:border-red-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]",
    outline: "bg-transparent text-neon-purple border-neon-purple/50 hover:bg-neon-purple/10 hover:border-neon-purple hover:shadow-[0_0_15px_rgba(188,19,254,0.4)]",
  };

  return (
    <button 
      className={cn(
        "cyber-button px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <div className="mb-8">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl md:text-4xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 uppercase tracking-wider mb-2"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 font-mono text-sm md:text-base border-l-2 border-neon-blue pl-3 ml-1"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
